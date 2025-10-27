import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PaymentDialog } from "./PaymentDialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);

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
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const finalAmount = Math.max(0, amount - availableCredits);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="w-full sm:w-auto"
        size="default"
      >
        {finalAmount === 0 ? (
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

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bookingId={bookingId}
        amount={amount}
        title={title}
        description={description}
        availableCredits={availableCredits}
        onSuccess={() => {
          setDialogOpen(false);
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};
