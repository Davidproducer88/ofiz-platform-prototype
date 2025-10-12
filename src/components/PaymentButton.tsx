import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          bookingId,
          amount,
          title,
          description,
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
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pagar con Mercado Pago
        </>
      )}
    </Button>
  );
};
