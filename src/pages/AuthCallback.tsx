import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { getDashboardRoute } from '@/utils/dashboardRedirect';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for tokens in hash fragment (OAuth providers like Google use this)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        
        // Also check query parameters (email confirmation uses this)
        const urlParams = new URLSearchParams(window.location.search);
        const queryAccessToken = urlParams.get('access_token');
        const queryRefreshToken = urlParams.get('refresh_token');
        
        // Use hash tokens if available, otherwise use query params
        const accessToken = hashAccessToken || queryAccessToken;
        const refreshToken = hashRefreshToken || queryRefreshToken;
        
        // If we have tokens in URL, set session manually
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
            // Wait for profile to be created/fetched
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fetch profile to get user_type
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', sessionData.session.user.id)
              .maybeSingle();
            
            toast({
              title: "¡Bienvenido!",
              description: "Has iniciado sesión correctamente"
            });
            
            // Check if user is admin first
            try {
              const { data: isAdmin } = await supabase.rpc('is_admin');
              
              if (isAdmin) {
                navigate('/admin-dashboard', { replace: true });
                return;
              }
            } catch (err) {
              console.error('Error checking admin status:', err);
            }
            
            // Get user type from profile or metadata
            const userType = profileData?.user_type || 
                           sessionData.session.user.user_metadata?.user_type || 
                           'client';
            const dashboardRoute = getDashboardRoute(userType as 'client' | 'master' | 'admin' | 'business');
            navigate(dashboardRoute, { replace: true });
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

        if (!data.session) {
          toast({
            title: "No hay sesión activa",
            description: "Por favor, inicia sesión nuevamente"
          });
          navigate('/auth');
          return;
        }

        // Wait for profile to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch profile to get accurate user_type
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle();

        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente"
        });

        // Check if user is admin first
        try {
          const { data: isAdmin } = await supabase.rpc('is_admin');
          
          if (isAdmin) {
            navigate('/admin-dashboard', { replace: true });
            return;
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
        }

        // Get user type from profile or metadata, default to client
        const userType = profileData?.user_type || 
                       data.session.user.user_metadata?.user_type || 
                       'client';
        const dashboardRoute = getDashboardRoute(userType as 'client' | 'master' | 'admin' | 'business');
        navigate(dashboardRoute, { replace: true });
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