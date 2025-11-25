import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Gift, AlertCircle, Shield, CreditCard, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BookingCheckoutBrick } from "./BookingCheckoutBrick";
import { calculatePayment, PaymentMethodType } from "@/utils/paymentCalculator";

interface RemainingPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  remainingAmount: number;
  title: string;
  description: string;
  onSuccess?: () => void;
}

export const RemainingPaymentDialog = ({
  open,
  onOpenChange,
  bookingId,
  remainingAmount,
  title,
  description,
  onSuccess,
}: RemainingPaymentDialogProps) => {
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [paymentMethod] = useState<PaymentMethodType>('mp_cuenta_debito_prepaga_redes');

  // Calcular para pago parcial (50%)
  const calculation = calculatePayment({
    priceBase: remainingAmount * 2, // El remaining es la mitad
    paymentType: 'partial',
    paymentMethod,
    accreditation: 'immediate',
    creditsAvailable: availableCredits
  });

  useEffect(() => {
    if (open && profile?.id) {
      fetchAvailableCredits();
    }
  }, [open, profile]);

  const fetchAvailableCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_credits')
        .select('amount')
        .eq('user_id', profile?.id)
        .eq('used', false);

      if (error) throw error;

      const total = data?.reduce((sum, credit) => sum + Number(credit.amount), 0) || 0;
      setAvailableCredits(total);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const finalAmount = Math.max(0, remainingAmount - availableCredits);

  const handleStartPayment = async () => {
    if (!profile?.id) {
      toast.error("Debes iniciar sesión para realizar el pago");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Verificar booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('client_id, master_id, status')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('No se encontró la reserva');
      }

      if (booking.client_id !== profile.id) {
        throw new Error('No tienes permiso para pagar esta reserva');
      }

      if (booking.status !== 'completed') {
        throw new Error('El servicio debe estar completado para pagar el saldo');
      }

      // Verificar que existe un pago parcial previo
      const { data: previousPayment, error: paymentError } = await supabase
        .from('payments')
        .select('id, is_partial_payment, remaining_amount')
        .eq('booking_id', bookingId)
        .eq('is_partial_payment', true)
        .single();

      if (paymentError || !previousPayment) {
        throw new Error('No se encontró el pago inicial del 50%');
      }

      // Si hay créditos, aplicarlos
      if (availableCredits > 0) {
        const creditsToUse = Math.min(availableCredits, remainingAmount);
        
        const { error: updateError } = await supabase
          .from('referral_credits')
          .update({ 
            used: true,
            used_in_booking_id: bookingId
          })
          .eq('user_id', profile.id)
          .eq('used', false)
          .limit(Math.ceil(creditsToUse / 100));

        if (updateError) {
          throw new Error('Error al aplicar créditos');
        }

        toast.success(`Se aplicaron $${creditsToUse.toLocaleString()} en créditos`);
      }

      // Si el pago se cubre 100% con créditos
      if (finalAmount === 0) {
        const commissionAmount = remainingAmount * 0.05;
        const masterAmount = remainingAmount - commissionAmount;

        const { error: paymentInsertError } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingId,
            client_id: booking.client_id,
            master_id: booking.master_id,
            amount: remainingAmount,
            commission_amount: commissionAmount,
            master_amount: masterAmount,
            status: 'approved',
            payment_method: 'credits',
            payment_percentage: 50,
            remaining_amount: 0,
            is_partial_payment: false,
            remaining_payment_id: previousPayment.id,
            metadata: {
              paid_with_credits: true,
              credits_used: availableCredits,
              is_remaining_payment: true
            }
          });

        if (paymentInsertError) throw paymentInsertError;

        toast.success('¡Pago completado con créditos!');
        onOpenChange(false);
        if (onSuccess) onSuccess();
        return;
      }

      // Mostrar formulario de pago
      setShowPaymentForm(true);
      setProcessing(false);

    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Revertir créditos si hubo error
      if (availableCredits > 0) {
        await supabase
          .from('referral_credits')
          .update({ 
            used: false,
            used_in_booking_id: null
          })
          .eq('user_id', profile.id)
          .eq('used_in_booking_id', bookingId);
      }

      setError(err.message || 'Error al procesar el pago');
      toast.error(err.message || 'Error al procesar el pago');
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Remaining payment completed:', paymentData);
    
    if (paymentData.status === 'approved') {
      toast.success('¡Pago del saldo completado exitosamente!');
      
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1000);
    } else if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
      toast('Pago pendiente', {
        description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
      });
      
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      toast.error('El pago no fue aprobado. Por favor intenta nuevamente.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setError(error.message || 'Error al procesar el pago');
    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!showPaymentForm ? (
          <div className="space-y-4 py-4">
            {/* Info sobre pago restante */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Estás pagando el <strong>50% restante</strong> del servicio completado. 
                Los fondos se mantendrán en escrow hasta que liberes el pago al profesional.
              </AlertDescription>
            </Alert>

            {/* Detalle del pago */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo pendiente (50%):</span>
                <span className="font-medium">${remainingAmount.toLocaleString()}</span>
              </div>

              {availableCredits > 0 && (
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">Créditos disponibles:</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">
                    -${Math.min(availableCredits, remainingAmount).toLocaleString()}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total a pagar:</span>
                <span className="text-2xl font-bold text-primary">
                  ${finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Protección Escrow */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Protección Escrow</h4>
                <p className="text-xs text-muted-foreground">
                  Este pago se mantendrá seguro en escrow. Podrás liberar los fondos 
                  al profesional cuando confirmes que el trabajo está completado a tu satisfacción.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStartPayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  'Procesando...'
                ) : finalAmount === 0 ? (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Confirmar pago
                  </>
                ) : (
                  'Continuar al pago'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <BookingCheckoutBrick
              amount={finalAmount}
              bookingId={bookingId}
              paymentPercentage={50}
              maxInstallments={3}
              incentiveDiscount={0}
              paymentMethod={paymentMethod}
              calculation={calculation}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
