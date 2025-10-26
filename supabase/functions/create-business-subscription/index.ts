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
  contacts: number;
  canPostAds: boolean;
  adImpressions: number;
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

    const { planId, planName, price, contacts, canPostAds, adImpressions }: SubscriptionRequest = await req.json();

    console.log('Creating business subscription for user:', user.id, 'plan:', planId);

    // Get business profile
    const { data: businessProfile } = await supabaseClient
      .from('business_profiles')
      .select('company_name')
      .eq('id', user.id)
      .maybeSingle();

    const displayName = businessProfile?.company_name || user.email?.split('@')[0] || 'Usuario';

    // Create subscription preference with Mercado Pago
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    const preference = {
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'UYU',
      },
      back_url: `https://ofiz.com.uy/business-dashboard?subscription=success`,
      reason: `Suscripción ${planName} - Ofiz Business`,
      external_reference: user.id,
      payer_email: user.email,
      metadata: {
        business_id: user.id,
        plan_id: planId,
        plan_name: planName,
        contacts: contacts,
        can_post_ads: canPostAds,
        ad_impressions: adImpressions,
      }
    };

    console.log('Creating subscription preference with MercadoPago:', preference);

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
      console.error('Mercado Pago error:', errorData);
      throw new Error(`Error de Mercado Pago: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();
    console.log('MercadoPago subscription created:', mpData.id);

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseClient
      .from('business_subscriptions')
      .select('id')
      .eq('business_id', user.id)
      .maybeSingle();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('business_subscriptions')
        .update({
          plan_type: planId,
          price: price,
          monthly_contacts_limit: contacts,
          can_post_ads: canPostAds,
          ad_impressions_limit: adImpressions,
          mercadopago_subscription_id: mpData.id,
          status: 'pending',
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from('business_subscriptions')
        .insert({
          business_id: user.id,
          plan_type: planId,
          price: price,
          monthly_contacts_limit: contacts,
          can_post_ads: canPostAds,
          ad_impressions_limit: adImpressions,
          mercadopago_subscription_id: mpData.id,
          status: 'pending',
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
    console.error('Error in create-business-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
