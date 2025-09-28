import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationNoticeProps {
  email: string;
  onBack: () => void;
}

export const EmailVerificationNotice = ({ email, onBack }: EmailVerificationNoticeProps) => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { toast } = useToast();

  const resendVerification = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Error al reenviar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setResent(true);
        toast({
          title: "Correo reenviado",
          description: "Te hemos enviado un nuevo enlace de verificación"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifica tu email</CardTitle>
          <CardDescription>
            Te hemos enviado un correo de confirmación a <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Sigue estos pasos:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Busca el correo de OFIZ</li>
                  <li>Haz clic en el enlace de verificación</li>
                  <li>Regresa aquí para iniciar sesión</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿No recibiste el correo? Revisa tu carpeta de spam o solicita uno nuevo
            </p>
            
            <Button
              type="button"
              variant="outline"
              onClick={resendVerification}
              disabled={resending || resent}
              className="w-full"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : resent ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Correo enviado
                </>
              ) : (
                'Reenviar correo de verificación'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full"
            >
              Volver al registro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};