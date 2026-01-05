import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterClientRequest {
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

    const requestData: RegisterClientRequest = await req.json();
    console.log('Register client request received for:', requestData.email);

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
              user_type: 'client'
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
        user_type: 'client',
        full_name: requestData.full_name || requestData.email.split('@')[0]
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      throw new Error(authError?.message || 'Error al crear usuario');
    }

    console.log('Auth user created:', authData.user.id);

    // 2. Actualizar perfil (el trigger handle_new_user ya lo creó)
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        user_type: 'client',
        full_name: requestData.full_name || requestData.email.split('@')[0],
        phone: requestData.phone || null,
        address: requestData.address || null,
        city: requestData.city || null,
        email_verified: false
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Rollback: eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Error al actualizar perfil: ' + profileError.message);
    }

    console.log('Profile updated for user:', authData.user.id);

    // 3. Procesar referidos si aplica
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

    // 4. Generar link de verificación y enviar email
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

    // 5. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cliente registrado exitosamente. Por favor verifica tu email.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          user_type: 'client'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in register-client function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al registrar cliente'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
