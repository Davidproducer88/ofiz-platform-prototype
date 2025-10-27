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
import { CreditCard, Loader2, Gift, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = Math.max(0, amount - availableCredits);
  const discount = amount - finalAmount;

  const handlePayment = async () => {
    if (!profile?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para realizar el pago",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar que el booking exista
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('client_id, master_id, total_price, status')
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
          console.error('Error updating credits:', updateError);
          throw new Error('Error al aplicar créditos');
        }
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

        toast({
          title: "¡Pago completado!",
          description: "El servicio fue cubierto con tus créditos",
        });

        onOpenChange(false);
        if (onSuccess) onSuccess();
        return;
      }

      // Crear preferencia de pago con Mercado Pago
      console.log('Creating payment preference for booking:', bookingId);

      const { data, error: functionError } = await supabase.functions.invoke(
        'create-payment-preference',
        {
          body: {
            bookingId,
            amount: finalAmount,
            title,
            description: discount > 0 
              ? `${description} (Descuento: $${discount.toLocaleString()})`
              : description,
          }
        }
      );

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Error al crear la preferencia de pago');
      }

      if (!data?.initPoint) {
        throw new Error('No se recibió el link de pago');
      }

      // Redirigir a Mercado Pago
      window.location.href = data.initPoint;

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
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: err.message || "Intenta nuevamente en unos momentos",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar pago</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Descripción */}
          <div className="text-sm text-muted-foreground">
            {description}
          </div>

          <Separator />

          {/* Detalle del pago */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto del servicio:</span>
              <span className="font-medium">${amount.toLocaleString()}</span>
            </div>

            {availableCredits > 0 && (
              <>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">Créditos aplicados:</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">
                    -${availableCredits.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total a pagar:</span>
              <span className="text-2xl font-bold text-primary">
                ${finalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Información sobre Mercado Pago */}
          {finalAmount > 0 && (
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                Serás redirigido a Mercado Pago para completar el pago de forma segura
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : finalAmount === 0 ? (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Confirmar
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar ${finalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};