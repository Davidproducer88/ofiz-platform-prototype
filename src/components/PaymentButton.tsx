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
    try {
      setLoading(true);

      // Si hay créditos disponibles, marcarlos como usados
      if (availableCredits > 0) {
        const { error: updateError } = await supabase
          .from('referral_credits')
          .update({ 
            used: true,
            used_in_booking_id: bookingId
          })
          .eq('user_id', profile?.id)
          .eq('used', false);

        if (updateError) {
          console.error('Error updating credits:', updateError);
        } else {
          toast({
            title: "¡Créditos aplicados!",
            description: `Se aplicaron $U ${availableCredits.toLocaleString()} de descuento`,
          });
        }
      }

      // Si el monto final es 0, no crear preferencia de pago
      if (finalAmount === 0) {
        toast({
          title: "¡Pago completado!",
          description: "El servicio fue cubierto completamente con tus créditos",
        });
        if (onSuccess) onSuccess();
        return;
      }

      // Crear preferencia de pago con el monto final
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

      if (error) throw error;

      // Redirect to Mercado Pago checkout
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: error.message || "No se pudo crear la preferencia de pago",
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
