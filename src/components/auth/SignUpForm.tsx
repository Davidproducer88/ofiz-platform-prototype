import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Gift } from 'lucide-react';
import { z } from 'zod';
const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});
interface SignUpFormProps {
  userType: 'client' | 'master' | 'business';
  onBack: () => void;
  onEmailVerification?: (email: string) => void;
}
export const SignUpForm = ({
  userType,
  onBack,
  onEmailVerification
}: SignUpFormProps) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const {
    signUp
  } = useAuth();
  const navigate = useNavigate();

  // Validar código de referido cuando cambia
  useEffect(() => {
    if (formData.referralCode.length >= 6 && userType === 'client') {
      validateReferralCode(formData.referralCode);
    } else {
      setReferralValid(null);
    }
  }, [formData.referralCode, userType]);

  const validateReferralCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      setReferralValid(!!data && !error);
    } catch (error) {
      setReferralValid(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = signUpSchema.safeParse(formData);
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
    setLoading(true);
    try {
      const {
        error
      } = await signUp(formData.email, formData.password, {
        ...formData,
        user_type: userType,
        referral_code: formData.referralCode || undefined
      });
      
      if (!error) {
        // Si hay código de referido, crear el referral y los créditos
        if (formData.referralCode && userType === 'client') {
          await processReferral(formData.referralCode);
        }
        
        // Show email verification notice if callback provided
        if (onEmailVerification) {
          onEmailVerification(formData.email);
        } else {
          // Fallback to URL redirect
          navigate('/auth?message=verify-email&email=' + encodeURIComponent(formData.email));
        }
      }
    } catch (error) {
      console.error('SignUp error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReferral = async (code: string) => {
    try {
      // Obtener el ID del referrer
      const { data: referrerData } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('code', code.toUpperCase())
        .single();

      if (!referrerData) return;

      // Obtener el ID del nuevo usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Crear el registro de referral
      const { data: referral, error: refError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerData.user_id,
          referred_id: user.id,
          referral_code: code.toUpperCase(),
          status: 'completed'
        })
        .select()
        .single();

      if (refError) {
        console.error('Error creating referral:', refError);
        return;
      }

      // Crear créditos para ambos usuarios
      await supabase.from('referral_credits').insert([
        {
          user_id: referrerData.user_id,
          amount: 500,
          type: 'referrer_bonus',
          referral_id: referral.id
        },
        {
          user_id: user.id,
          amount: 500,
          type: 'welcome_bonus',
          referral_id: referral.id
        }
      ]);

      toast({
        title: "¡Bienvenido!",
        description: "Recibiste $U 500 de crédito de bienvenida 🎉",
      });
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };
  return <div className="space-y-6">
      <Button type="button" variant="ghost" onClick={onBack} className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Cambiar tipo de cuenta
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} disabled={loading} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} disabled={loading} className="pr-10" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} disabled={loading} className="pr-10" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>

        {userType === 'client' && (
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Código de referido (opcional)
            </Label>
            <Input 
              id="referralCode" 
              type="text" 
              placeholder="Ingresa el código de tu amigo" 
              value={formData.referralCode} 
              onChange={e => handleInputChange('referralCode', e.target.value.toUpperCase())} 
              disabled={loading}
              className={referralValid === true ? 'border-green-500' : referralValid === false ? 'border-red-500' : ''}
            />
            {referralValid === true && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                ✓ ¡Código válido! Recibirás $U 500 de bienvenida
              </p>
            )}
            {referralValid === false && formData.referralCode && (
              <p className="text-sm text-destructive">
                Código inválido
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </div>;
};