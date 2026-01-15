import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, RATE_LIMITS, formatRemainingTime } from '@/utils/rateLimit';
import { toast } from '@/hooks/use-toast';
import { getDashboardRoute } from '@/utils/dashboardRedirect';
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = loginSchema.safeParse({
      email,
      password
    });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(error => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Rate limiting
    const rateLimitKey = `login:${email}`;
    if (!rateLimiter.check(rateLimitKey, RATE_LIMITS.LOGIN)) {
      const remaining = rateLimiter.getRemainingTime(rateLimitKey);
      toast({
        title: "Demasiados intentos",
        description: `Por favor espera ${formatRemainingTime(remaining)} antes de intentar de nuevo`,
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await signIn(email, password);
      if (!error) {
        // Reset rate limit on successful login
        rateLimiter.reset(rateLimitKey);
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if user is admin first
        try {
          const {
            data: isAdmin
          } = await supabase.rpc('is_admin');
          if (isAdmin) {
            navigate('/admin-dashboard', {
              replace: true
            });
            return;
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
        }

        // Get session and redirect based on user type from profile
        const { data: sessionData } = await supabase.auth.getSession();
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', sessionData.session?.user.id)
          .maybeSingle();

        const userType = profileData?.user_type || 
                        sessionData.session?.user.user_metadata?.user_type || 
                        'client';
        
        navigate(getDashboardRoute(userType as 'client' | 'master' | 'admin' | 'business'), {
          replace: true
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} placeholder="tu@gmail.com" />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className="pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>;
};