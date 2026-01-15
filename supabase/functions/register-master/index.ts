import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Founder program constants
const FOUNDER_LIMIT = 1000;
const FOUNDER_DISCOUNT_PERCENT = 30;

interface RegisterMasterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  referral_code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: RegisterMasterRequest = await req.json();
    console.log('Register master request received for:', requestData.email);

    // Validaciones
    if (!requestData.email || !requestData.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (requestData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      throw new Error('Email inválido');
    }

    // Verificar si el email ya existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === requestData.email);
    
    if (existingUser) {
      // Si el email ya existe pero NO está verificado, reenviar email de verificación
      if (!existingUser.email_confirmed_at) {
        console.log('User exists but not verified, resending verification email:', requestData.email);
        
        try {
          // Generar nuevo link de verificación
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: requestData.email,
            options: {
              redirectTo: 'https://ofiz.com.uy/auth/callback?type=signup'
            }
          });

          if (!linkError && linkData.properties?.action_link) {
            // Enviar email de verificación
            await supabaseAdmin.functions.invoke('send-verification-email', {
              body: {
                email: requestData.email,
                confirmation_url: linkData.properties.action_link,
                user_name: existingUser.user_metadata?.full_name || requestData.email.split('@')[0]
              }
            });
            console.log('Verification email resent to:', requestData.email);
          }
        } catch (resendError) {
          console.error('Error resending verification email:', resendError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Ya tienes una cuenta pendiente de verificación. Te hemos reenviado el email de confirmación.',
            resent_verification: true,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              user_type: 'master'
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      // Si el email está verificado, es un error real
      throw new Error('Este email ya está registrado. Por favor inicia sesión.');
    }

    // Procesar código de referido si existe
    let referrerUserId: string | null = null;
    if (requestData.referral_code) {
      const { data: referralCode } = await supabaseAdmin
        .from('referral_codes')
        .select('user_id')
        .eq('code', requestData.referral_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (referralCode) {
        referrerUserId = referralCode.user_id;
      }
    }

    // 1. Crear usuario en auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: false, // Requiere verificación de email
      user_metadata: {
        user_type: 'master',
        full_name: requestData.full_name || requestData.email.split('@')[0]
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      throw new Error(authError?.message || 'Error al crear usuario');
    }

    console.log('Auth user created:', authData.user.id);

    // 2. Check if user qualifies as founder (first 1000 masters)
    const { count: founderCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_founder', true)
      .eq('user_type', 'master');

    const isFounder = (founderCount || 0) < FOUNDER_LIMIT;
    console.log('Founder check:', { currentFounders: founderCount, limit: FOUNDER_LIMIT, willBeFounder: isFounder });

    // 3. Actualizar perfil (el trigger handle_new_user ya lo creó)
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        user_type: 'master',
        full_name: requestData.full_name || requestData.email.split('@')[0],
        phone: requestData.phone || null,
        address: requestData.address || null,
        city: requestData.city || null,
        email_verified: false,
        is_founder: isFounder,
        founder_registered_at: isFounder ? new Date().toISOString() : null,
        founder_discount_percentage: isFounder ? FOUNDER_DISCOUNT_PERCENT : null
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Rollback: eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Error al actualizar perfil: ' + profileError.message);
    }

    console.log('Profile updated for user:', authData.user.id, '- Founder:', isFounder);

    // 3. Crear registro en masters
    const { error: masterError } = await supabaseAdmin
      .from('masters')
      .insert({
        id: authData.user.id,
        business_name: requestData.full_name 
          ? `${requestData.full_name} - Servicios`
          : `${requestData.email.split('@')[0]} - Servicios`,
        is_verified: false,
        rating: 0,
        total_reviews: 0,
        experience_years: 0
      });

    if (masterError) {
      console.error('Error creating master record:', masterError);
      // Rollback: eliminar perfil y usuario
      await supabaseAdmin.from('profiles').delete().eq('id', authData.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Error al crear registro de maestro: ' + masterError.message);
    }

    console.log('Master record created for user:', authData.user.id);

    // 4. Create founder discount code if user is a founder
    if (isFounder) {
      const founderCode = `FUNDADOR${authData.user.id.substring(0, 6).toUpperCase()}`;
      
      const { error: codeError } = await supabaseAdmin
        .from('founder_discount_codes')
        .insert({
          user_id: authData.user.id,
          code: founderCode,
          discount_percentage: FOUNDER_DISCOUNT_PERCENT,
          description: `Código de descuento fundador - ${FOUNDER_DISCOUNT_PERCENT}% OFF`,
          is_active: true,
          max_uses: 10, // Each founder can share with up to 10 people
          times_used: 0,
          valid_from: new Date().toISOString()
        });

      if (codeError) {
        console.error('Error creating founder discount code:', codeError);
        // Don't rollback for this, just log the error
      } else {
        console.log('Founder discount code created:', founderCode);
      }

      // Create notification for new founder
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: authData.user.id,
          type: 'founder_welcome',
          title: '🎉 ¡Bienvenido Fundador!',
          message: `Eres uno de los primeros ${FOUNDER_LIMIT} maestros. Tienes ${FOUNDER_DISCOUNT_PERCENT}% de descuento permanente y tu código para compartir es: ${founderCode}`,
          metadata: {
            founder_code: founderCode,
            discount_percentage: FOUNDER_DISCOUNT_PERCENT
          }
        });
    }

    // 4. Procesar referidos si aplica
    if (referrerUserId) {
      // Crear registro de referido
      const { error: referralError } = await supabaseAdmin
        .from('referrals')
        .insert({
          referrer_id: referrerUserId,
          referred_id: authData.user.id,
          referral_code: requestData.referral_code!.toUpperCase(),
          status: 'pending'
        });

      if (referralError) {
        console.error('Error creating referral:', referralError);
        // No hacemos rollback por esto, solo logueamos el error
      } else {
        console.log('Referral created:', referrerUserId, '->', authData.user.id);
      }
    }

    // 5. Generar link de verificación y enviar email
    try {
      // Generar link de verificación usando la API de Supabase
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: requestData.email,
        options: {
          redirectTo: 'https://ofiz.com.uy/auth/callback?type=signup'
        }
      });

      if (linkError) {
        console.error('Error generating verification link:', linkError);
        throw linkError;
      }

      console.log('Verification link generated for:', requestData.email);

      // Enviar email de verificación con el link
      const { error: emailFnError } = await supabaseAdmin.functions.invoke('send-verification-email', {
        body: {
          email: requestData.email,
          confirmation_url: linkData.properties?.action_link || `https://ofiz.com.uy/auth?message=verify-email&email=${encodeURIComponent(requestData.email)}`,
          user_name: requestData.full_name || requestData.email.split('@')[0]
        }
      });

      if (emailFnError) {
        console.error('Error invoking send-verification-email:', emailFnError);
      } else {
        console.log('Verification email sent to:', requestData.email);
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // No hacemos rollback por esto, el usuario fue creado exitosamente
    }

    // 6. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Maestro registrado exitosamente. Por favor verifica tu email.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          user_type: 'master'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in register-master function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al registrar maestro'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
