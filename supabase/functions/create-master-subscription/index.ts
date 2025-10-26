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

    const { planId, planName, price, applicationsLimit, isFeatured }: SubscriptionRequest = await req.json();

    // Validate input
    if (!planId || !planName || price === undefined || applicationsLimit === undefined) {
      throw new Error('Datos de suscripción incompletos');
    }

    console.log('Creating master subscription for:', user.id, 'Plan:', planId);

    // Get master profile
    const { data: master } = await supabaseClient
      .from('masters')
      .select('business_name')
      .eq('id', user.id)
      .maybeSingle();

    const displayName = master?.business_name || user.email?.split('@')[0] || 'Profesional';

    // For free plan, just create/update the subscription in DB
    if (planId === 'free' || price === 0) {
      const { data: existingSubscription } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('master_id', user.id)
        .maybeSingle();

      if (existingSubscription) {
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            plan: planId,
            price: 0,
            monthly_applications_limit: applicationsLimit,
            is_featured: false,
            applications_used: 0,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', existingSubscription.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseClient
          .from('subscriptions')
          .insert({
            master_id: user.id,
            plan: planId,
            price: 0,
            monthly_applications_limit: applicationsLimit,
            is_featured: false,
            applications_used: 0,
          });

        if (insertError) throw insertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Plan gratuito activado correctamente',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // For paid plans, create MercadoPago subscription
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    const preference = {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'UYU',
      },
      back_url: `${req.headers.get('origin') || 'https://ofiz.com.uy'}/master-dashboard?subscription=success`,
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

    // Check if subscription exists
    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('master_id', user.id)
      .maybeSingle();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          plan: planId,
          price: price,
          monthly_applications_limit: applicationsLimit,
          is_featured: isFeatured,
          mercadopago_subscription_id: mpData.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from('subscriptions')
        .insert({
          master_id: user.id,
          plan: planId,
          price: price,
          monthly_applications_limit: applicationsLimit,
          is_featured: isFeatured,
          mercadopago_subscription_id: mpData.id,
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
