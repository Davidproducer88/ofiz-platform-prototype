import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PaymentButtonProps {
  bookingId: string;
  amount: number;
  title: string;
  description: string;
  onSuccess?: () => void;
}

export const PaymentButton = ({ 
  bookingId, 
  amount, 
  title, 
  description,
  onSuccess 
}: PaymentButtonProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [finalAmount, setFinalAmount] = useState(amount);

  useEffect(() => {
    if (profile?.id) {
      fetchAvailableCredits();
    }
  }, [profile]);

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
      
      // Calcular monto final después de aplicar créditos
      const newAmount = Math.max(0, amount - total);
      setFinalAmount(newAmount);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handlePayment = async () => {
    if (!profile?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para realizar el pago",
      });
      return;
    }

    try {
      setLoading(true);

      // Verificar que el booking exista
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('client_id, master_id, total_price')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('No se encontró la reserva');
      }

      if (booking.client_id !== profile.id) {
        throw new Error('No tienes permiso para pagar esta reserva');
      }

      // Si hay créditos disponibles, marcarlos como usados
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

        toast({
          title: "¡Créditos aplicados!",
          description: `Se aplicaron $U ${availableCredits.toLocaleString()} de descuento`,
        });
      }

      // Si el monto final es 0, crear pago completado sin Mercado Pago
      if (finalAmount === 0) {
        // Calcular comisión
        const commissionAmount = amount * 0.05;
        const masterAmount = amount - commissionAmount;

        // Crear registro de pago como aprobado
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

        if (paymentError) {
          console.error('Error creating payment:', paymentError);
          throw new Error('Error al crear el registro de pago');
        }

        // Actualizar estado del booking
        const { error: updateBookingError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        if (updateBookingError) {
          console.error('Error updating booking:', updateBookingError);
        }

        toast({
          title: "¡Pago completado!",
          description: "El servicio fue cubierto completamente con tus créditos",
        });

        if (onSuccess) onSuccess();
        return;
      }

      // Crear preferencia de pago con Mercado Pago para el monto final
      console.log('Creating payment preference:', { bookingId, finalAmount, title });

      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          bookingId,
          amount: finalAmount,
          title,
          description: availableCredits > 0 
            ? `${description} (Con descuento de $U ${availableCredits.toLocaleString()})`
            : description,
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.initPoint) {
        throw new Error('No se recibió el link de pago de Mercado Pago');
      }

      console.log('Payment preference created, redirecting to:', data.initPoint);

      // Redirigir a Mercado Pago
      window.location.href = data.initPoint;

    } catch (error: any) {
      console.error('Error in payment process:', error);
      
      // Revertir créditos si hubo error
      if (availableCredits > 0) {
        await supabase
          .from('referral_credits')
          .update({ 
            used: false,
            used_in_booking_id: null
          })
          .eq('user_id', profile?.id)
          .eq('used_in_booking_id', bookingId);
      }

      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: error.message || "No se pudo procesar el pago. Por favor intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {availableCredits > 0 && (
        <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Créditos disponibles:</span>
          </div>
          <span className="text-sm font-bold text-secondary">
            $U {availableCredits.toLocaleString()}
          </span>
        </div>
      )}
      
      {availableCredits > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Monto original:</span>
          <span className="line-through">${amount.toLocaleString()}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between text-lg font-bold">
        <span>Total a pagar:</span>
        <span className="text-primary">
          ${finalAmount.toLocaleString()}
        </span>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : finalAmount === 0 ? (
          <>
            <Gift className="mr-2 h-4 w-4" />
            Confirmar con créditos
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar ${finalAmount.toLocaleString()}
          </>
        )}
      </Button>
    </div>
  );
};
