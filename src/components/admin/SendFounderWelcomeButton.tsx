import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface SendFounderWelcomeButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
  disabled?: boolean;
}

export const SendFounderWelcomeButton = ({
  userId,
  userName,
  userEmail,
  disabled = false,
}: SendFounderWelcomeButtonProps) => {
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    try {
      setSending(true);
      
      // Llamar al edge function para enviar el email
      const { data, error } = await supabase.functions.invoke('send-founder-welcome-email');

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: `Email de bienvenida enviado a ${userName}`,
      });
    } catch (error: any) {
      console.error("Error sending founder welcome email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar el email",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      onClick={handleSendEmail}
      disabled={disabled || sending}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      <Mail className="h-4 w-4" />
      {sending ? "Enviando..." : "Enviar Email Bienvenida"}
    </Button>
  );
};
