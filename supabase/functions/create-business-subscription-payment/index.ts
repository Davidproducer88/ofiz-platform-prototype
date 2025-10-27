import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessSubscriptionPaymentRequest {
  planId: string;
  planName: string;
  price: number;
  contacts: number;
  canPostAds: boolean;
  adImpressions: number;
  paymentMethodId?: string;
  token?: string;
  issuerId?: string;
  installments?: number;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
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
    if (!user || !user.email) {
      throw new Error('No autenticado');
    }

    const { 
      planId, 
      planName, 
      price, 
      contacts,
      canPostAds,
      adImpressions,
      paymentMethodId, 
      token, 
      issuerId, 
      installments, 
      payer 
    }: BusinessSubscriptionPaymentRequest = await req.json();
    
    console.log('Business subscription payment request:', { 
      planId, 
      planName,
      price,
      hasToken: !!token,
      userId: user.id 
    });

    if (!planId || !planName || price === undefined) {
      throw new Error('Datos de suscripción incompletos');
    }

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago no está configurado');
    }

    // Create payment using Bricks API
    const paymentData = {
      transaction_amount: price,
      token: token,
      description: `Suscripción Empresarial ${planName}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payer?.email || user.email,
        identification: payer?.identification,
      },
      external_reference: `${user.id}-business-${planId}`,
      statement_descriptor: 'OFIZ EMPRESA',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        business_id: user.id,
        plan_id: planId,
        plan_name: planName,
        type: 'business_subscription'
      }
    };

    console.log('Creating business subscription payment with Bricks API');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `business-sub-${user.id}-${planId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Mercado Pago error:', errorData);
      throw new Error(`Error de Mercado Pago: ${mpResponse.status} - ${errorData}`);
    }

    const paymentResult = await mpResponse.json();
    console.log('Payment created:', {
      id: paymentResult.id,
      status: paymentResult.status,
      statusDetail: paymentResult.status_detail
    });

    // Create admin client for system operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if subscription exists
    const { data: existingSubscription } = await supabaseAdmin
      .from('business_subscriptions')
      .select('id')
      .eq('business_id', user.id)
      .maybeSingle();

    // If payment is approved, update subscription
    if (paymentResult.status === 'approved') {
      console.log('Payment approved - updating business subscription...');

      if (existingSubscription) {
        const { error: updateError } = await supabaseAdmin
          .from('business_subscriptions')
          .update({
            plan_type: planId,
            price: price,
            monthly_contacts_limit: contacts,
            contacts_used: 0,
            can_post_ads: canPostAds,
            ad_impressions_limit: adImpressions,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            mercadopago_payment_id: paymentResult.id.toString(),
          })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Error updating business subscription:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('business_subscriptions')
          .insert({
            business_id: user.id,
            plan_type: planId,
            price: price,
            monthly_contacts_limit: contacts,
            contacts_used: 0,
            can_post_ads: canPostAds,
            ad_impressions_limit: adImpressions,
            status: 'active',
            mercadopago_payment_id: paymentResult.id.toString(),
          });

        if (insertError) {
          console.error('Error creating business subscription:', insertError);
          throw insertError;
        }
      }

      console.log('Business subscription updated to active');

      // Create notification for business
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'subscription_activated',
          title: '✅ Suscripción empresarial activada',
          message: `Tu plan ${planName} está activo`,
          metadata: {
            plan_id: planId,
            payment_id: paymentResult.id.toString(),
            amount: price
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
        planId: planId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-business-subscription-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
