import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Gift, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingCheckoutBrick } from "./BookingCheckoutBrick";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  amount: number;
  title: string;
  description: string;
  availableCredits?: number;
  onSuccess?: () => void;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  bookingId,
  amount,
  title,
  description,
  availableCredits = 0,
  onSuccess,
}: PaymentDialogProps) => {
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const finalAmount = Math.max(0, amount - availableCredits);
  const discount = amount - finalAmount;

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
        .select('client_id, master_id')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('No se encontró la reserva');
      }

      if (booking.client_id !== profile.id) {
        throw new Error('No tienes permiso para pagar esta reserva');
      }

      // Si hay créditos, aplicarlos
      if (availableCredits > 0) {
        const { error: updateError } = await supabase
          .from('referral_credits')
          .update({ 
            used: true,
            used_in_booking_id: bookingId
          })
          .eq('user_id', profile.id)
          .eq('used', false);

        if (updateError) {
          throw new Error('Error al aplicar créditos');
        }

        toast.success(`Se aplicaron $${availableCredits.toLocaleString()} en créditos`);
      }

      // Si el pago se cubre 100% con créditos
      if (finalAmount === 0) {
        const commissionAmount = amount * 0.05;
        const masterAmount = amount - commissionAmount;

        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingId,
            client_id: booking.client_id,
            master_id: booking.master_id,
            amount: amount,
            commission_amount: commissionAmount,
            master_amount: masterAmount,
            status: 'approved',
            payment_method: 'credits',
            metadata: {
              paid_with_credits: true,
              credits_used: availableCredits
            }
          });

        if (paymentError) throw paymentError;

        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

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
    console.log('Payment completed successfully:', paymentData);
    
    if (paymentData.status === 'approved') {
      toast.success('¡Pago aprobado exitosamente!');
      
      // Close dialog
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!showPaymentForm ? (
          <div className="space-y-4 py-4">
            {/* Detalle del pago */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto del servicio:</span>
                <span className="font-medium">${amount.toLocaleString()}</span>
              </div>

              {availableCredits > 0 && (
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">Créditos aplicados:</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">
                    -${availableCredits.toLocaleString()}
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {finalAmount > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Completa el formulario de pago de forma segura con Mercado Pago
                </AlertDescription>
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
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};