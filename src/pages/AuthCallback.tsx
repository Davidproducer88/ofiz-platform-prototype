import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extract URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const userTypeFromUrl = urlParams.get('user_type');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        // If we have tokens in URL (email confirmation link), set session manually
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            toast({
              title: "Error de autenticación",
              description: sessionError.message,
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          if (sessionData.session) {
            toast({
              title: "¡Email verificado!",
              description: "Has iniciado sesión correctamente"
            });
            
            const userType = userTypeFromUrl || sessionData.session.user.user_metadata?.user_type;
            
            if (userType === 'master') {
              navigate('/master-dashboard');
            } else if (userType === 'admin') {
              navigate('/admin');
            } else if (userType === 'business') {
              navigate('/business-dashboard');
            } else {
              navigate('/client-dashboard');
            }
            return;
          }
        }
        
        // Otherwise check existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente"
          });
          
          const userType = userTypeFromUrl || data.session.user.user_metadata?.user_type;
          
          if (userType === 'master') {
            navigate('/master-dashboard');
          } else if (userType === 'admin') {
            navigate('/admin');
          } else if (userType === 'business') {
            navigate('/business-dashboard');
          } else {
            navigate('/client-dashboard');
          }
        } else {
          // No session and no tokens - just verified email
          if (type === 'signup') {
            toast({
              title: "Email verificado",
              description: "Tu cuenta ha sido verificada. Ya puedes iniciar sesión."
            });
          }
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl">Procesando autenticación</CardTitle>
          <CardDescription>
            Por favor espera mientras verificamos tu cuenta...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>Validando credenciales</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;