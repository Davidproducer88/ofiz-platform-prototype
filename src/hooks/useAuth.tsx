import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string;
  user_type: 'client' | 'master' | 'admin' | 'business';
  phone?: string;
  address?: string;
  city?: string;
  avatar_url?: string;
  email_verified?: boolean;
  login_provider?: string;
  verification_sent_at?: string;
  is_founder?: boolean;
  founder_registered_at?: string;
  free_trial_ends_at?: string;
  founder_discount_percentage?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      // Try to get the profile without forcing a single-object response to avoid 406 when no rows
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If there is no profile, create a minimal one from auth metadata
      if (!data) {
        const { data: userRes } = await supabase.auth.getUser();
        const authUser = userRes?.user;
        const meta = (authUser?.user_metadata as any) || {};
        const full_name = meta.full_name || authUser?.email?.split('@')[0] || 'Usuario';
        const user_type = meta.user_type || 'client';

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name,
            user_type,
            phone: meta.phone ?? null,
            address: meta.address ?? null,
            city: meta.city ?? null,
            // Founder benefits from metadata
            is_founder: meta.is_founder ?? false,
            founder_registered_at: meta.founder_registered_at ?? null,
            free_trial_ends_at: meta.free_trial_ends_at ?? null,
            founder_discount_percentage: meta.founder_discount_percentage ?? 0,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.error('Error creating missing profile:', insertError);
          return null;
        }
        return created;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpMaster = async (email: string, password: string, userData: any) => {
    try {
      // Call edge function to handle master registration
      const { data, error } = await supabase.functions.invoke('register-master', {
        body: {
          email,
          password,
          full_name: userData.full_name,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          referral_code: userData.referral_code
        }
      });

      if (error) {
        toast({
          title: "Error en el registro",
          description: error.message || 'Error al registrar maestro',
          variant: "destructive"
        });
        return { error };
      }

      if (data?.error) {
        toast({
          title: "Error en el registro",
          description: data.error,
          variant: "destructive"
        });
        return { error: new Error(data.error) };
      }

      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu email para activar tu cuenta"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const userType = userData.user_type || 'client';
      
      // Use edge function for master registration
      if (userType === 'master') {
        return await signUpMaster(email, password, userData);
      }
      
      const redirectUrl = `${window.location.origin}/auth/callback?type=signup&user_type=${userType}`;
      
      // Calculate founder benefits
      const now = new Date();
      const freeTrialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.full_name || email.split('@')[0],
            user_type: userType,
            phone: userData.phone || null,
            address: userData.address || null,
            city: userData.city || null,
            // Founder benefits
            is_founder: true,
            founder_registered_at: now.toISOString(),
            free_trial_ends_at: freeTrialEndsAt.toISOString(),
            founder_discount_percentage: 10
          }
        }
      });

      if (error) {
        toast({
          title: "Error en el registro",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Process referral after successful signup if provided
      if (userData.referral_code && userType === 'client' && data.user) {
        try {
          // Get referrer ID
          const { data: referrerData } = await supabase
            .from('referral_codes')
            .select('user_id')
            .eq('code', userData.referral_code.toUpperCase())
            .eq('is_active', true)
            .maybeSingle();

          if (referrerData) {
            // Create referral record
            const { data: referral, error: refError } = await supabase
              .from('referrals')
              .insert({
                referrer_id: referrerData.user_id,
                referred_id: data.user.id,
                referral_code: userData.referral_code.toUpperCase(),
                status: 'pending'
              })
              .select()
              .maybeSingle();

            if (!refError && referral) {
              // Create credits for both users
              await supabase.from('referral_credits').insert([
                {
                  user_id: referrerData.user_id,
                  amount: 500,
                  type: 'referrer_bonus',
                  referral_id: referral.id
                },
                {
                  user_id: data.user.id,
                  amount: 500,
                  type: 'welcome_bonus',
                  referral_id: referral.id
                }
              ]);
            }
          }
        } catch (refError) {
          console.error('Error processing referral:', refError);
          // Don't fail the signup if referral fails
        }
      }

      toast({
        title: "Registro exitoso",
        description: "Por favor verifica tu email para activar tu cuenta"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Error en el inicio de sesión",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de vuelta"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Error en el inicio de sesión",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
          scopes: provider === 'facebook' ? 'email' : undefined
        }
      });

      return { error };
    } catch (error: any) {
      toast({
        title: `Error con ${provider}`,
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
        }
      });

      if (error) {
        toast({
          title: "Error al reenviar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Correo reenviado",
          description: "Te hemos enviado un nuevo enlace de verificación"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    refreshProfile,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};