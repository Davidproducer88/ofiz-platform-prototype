import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { FounderWelcomeEmail } from './_templates/founder-welcome.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FounderWelcomeRequest {
  userId: string;
  userName: string;
  userEmail: string;
  discountCode: string;
  discountPercentage: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting founder welcome email process');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('No user found');
    }

    // Get user profile and discount code
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, is_founder, founder_discount_percentage, founder_registered_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    if (!profile?.is_founder) {
      throw new Error('User is not a founder');
    }

    // Get discount code
    const { data: discountCode, error: codeError } = await supabaseClient
      .from('founder_discount_codes')
      .select('code, discount_percentage')
      .eq('user_id', user.id)
      .single();

    if (codeError) {
      console.error('Error fetching discount code:', codeError);
      throw codeError;
    }

    console.log('Rendering email template...');

    // Render email template
    const html = await renderAsync(
      React.createElement(FounderWelcomeEmail, {
        userName: profile.full_name,
        discountCode: discountCode.code,
        discountPercentage: Number(discountCode.discount_percentage),
        registrationDate: new Date(profile.founder_registered_at).toLocaleDateString('es-UY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
    );

    console.log('Sending email via Resend...');

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Ofiz - Programa Fundadores <onboarding@resend.dev>',
      to: [user.email!],
      subject: '🎉 ¡Bienvenido al Programa de Fundadores de Ofiz!',
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: data?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-founder-welcome-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
