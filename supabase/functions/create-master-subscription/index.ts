import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  planId: string;
  planName: string;
  price: number;
  applicationsLimit: number;
  isFeatured: boolean;
  hasFounderDiscount?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('No autenticado');
    }

    const { planId, planName, price, applicationsLimit, isFeatured, hasFounderDiscount }: SubscriptionRequest = await req.json();

    // Validate input
    if (!planId || !planName || price === undefined || applicationsLimit === undefined) {
      throw new Error('Datos de suscripción incompletos');
    }

    console.log('Creating master subscription for:', user.id, 'Plan:', planId, 'Founder:', hasFounderDiscount);

    // Verify founder status from profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_founder, founder_discount_percentage')
      .eq('id', user.id)
      .single();

    const isFounder = profile?.is_founder || false;

    // If claiming founder benefit, verify they are actually a founder
    if (hasFounderDiscount && !isFounder) {
      throw new Error('No tienes acceso a beneficios de fundador');
    }

    // Get master profile
    const { data: master } = await supabaseClient
      .from('masters')
      .select('business_name')
      .eq('id', user.id)
      .maybeSingle();

    const displayName = master?.business_name || user.email?.split('@')[0] || 'Profesional';

    // For free plan or founder benefit (price = 0), activate directly
    if (planId === 'free' || price === 0) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: existingSubscription } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('master_id', user.id)
        .maybeSingle();

      // For founders, set a very long period (10 years = "de por vida")
      const periodEnd = isFounder && planId !== 'free'
        ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString() // 10 years
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

      const subscriptionData = {
        plan: planId,
        price: 0,
        monthly_applications_limit: applicationsLimit,
        is_featured: isFeatured,
        applications_used: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        has_founder_discount: isFounder && planId !== 'free',
      };

      if (existingSubscription) {
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', existingSubscription.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            master_id: user.id,
            ...subscriptionData,
          });

        if (insertError) throw insertError;
      }

      // Create notification for founder benefit activation
      if (isFounder && planId !== 'free') {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'founder_benefit',
            title: '🎉 ¡Beneficio de Fundador Activado!',
            message: `Tu plan ${planName} está activo de por vida como Maestro Fundador`,
            metadata: {
              plan_id: planId,
              plan_name: planName,
              is_founder: true
            }
          });
      }

      console.log('Subscription activated:', { planId, isFounder, hasFounderDiscount });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: isFounder && planId !== 'free' 
            ? `¡${planName} activado como Maestro Fundador!` 
            : 'Plan gratuito activado correctamente',
          isFounder: isFounder && planId !== 'free',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // For paid plans (non-founders), create MercadoPago subscription
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    const preference = {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price / 100, // Convert from cents
        currency_id: 'UYU',
      },
      back_url: `https://ofiz.com.uy/master-dashboard?subscription=success`,
      reason: `Suscripción ${planName} - ${displayName}`,
      external_reference: user.id,
      payer_email: user.email,
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        master_id: user.id,
        plan_id: planId,
        plan_name: planName,
      }
    };

    console.log('Creating MercadoPago subscription preference:', preference);

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('MercadoPago error:', errorData);
      throw new Error(`Error de MercadoPago: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();
    console.log('MercadoPago subscription created:', mpData.id);

    // Use admin client for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if subscription exists
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('master_id', user.id)
      .maybeSingle();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: planId,
          price: price,
          monthly_applications_limit: applicationsLimit,
          is_featured: isFeatured,
          mercadopago_subscription_id: mpData.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          has_founder_discount: false,
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          master_id: user.id,
          plan: planId,
          price: price,
          monthly_applications_limit: applicationsLimit,
          is_featured: isFeatured,
          mercadopago_subscription_id: mpData.id,
          has_founder_discount: false,
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        throw insertError;
      }
    }

    console.log('Subscription record created/updated');

    return new Response(
      JSON.stringify({ 
        subscriptionId: mpData.id,
        initPoint: mpData.init_point,
        message: 'Redirigiendo a MercadoPago para completar el pago...',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-master-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
