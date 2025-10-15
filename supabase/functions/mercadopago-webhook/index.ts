import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Received webhook notification:', JSON.stringify(body));

    // Mercado Pago sends notifications for different events
    
    // Handle subscription events
    if (body.type === 'subscription_preapproval' || body.type === 'subscription_authorized_payment') {
      const preapprovalId = body.data.id;
      console.log('Processing subscription notification for:', preapprovalId);

      const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      
      // Get subscription details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error(`Error fetching subscription from Mercado Pago: ${mpResponse.status}`);
      }

      const subscriptionData = await mpResponse.json();
      console.log('Subscription data from Mercado Pago:', JSON.stringify(subscriptionData));

      const businessId = subscriptionData.external_reference;
      const status = subscriptionData.status;

      // Update subscription status
      let subscriptionStatus: string;
      switch (status) {
        case 'authorized':
        case 'paused':
          subscriptionStatus = 'active';
          break;
        case 'pending':
          subscriptionStatus = 'pending';
          break;
        case 'cancelled':
          subscriptionStatus = 'cancelled';
          break;
        default:
          subscriptionStatus = 'pending';
      }

      const { error: updateError } = await supabaseClient
        .from('business_subscriptions')
        .update({
          status: subscriptionStatus,
        })
        .eq('business_id', businessId)
        .eq('mercadopago_subscription_id', preapprovalId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }

      console.log('Subscription updated:', businessId, subscriptionStatus);
    }
    
    // Handle regular payment events (bookings)
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log('Processing payment notification for:', paymentId);

      // Get payment details from Mercado Pago
      const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error(`Error fetching payment from Mercado Pago: ${mpResponse.status}`);
      }

      const paymentData = await mpResponse.json();
      console.log('Payment data from Mercado Pago:', JSON.stringify(paymentData));

      const bookingId = paymentData.external_reference;
      const status = paymentData.status;
      
      // Update payment record
      let paymentStatus: string;
      switch (status) {
        case 'approved':
          paymentStatus = 'in_escrow'; // Funds held in escrow until service completion
          break;
        case 'pending':
          paymentStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'rejected';
          break;
        default:
          paymentStatus = 'pending';
      }

      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: paymentStatus,
          mercadopago_payment_id: paymentId,
          payment_method: paymentData.payment_method_id,
          metadata: {
            payment_data: paymentData,
          }
        })
        .eq('booking_id', bookingId);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        throw updateError;
      }

      // Update booking status if payment approved
      if (status === 'approved') {
        const { error: bookingError } = await supabaseClient
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        if (bookingError) {
          console.error('Error updating booking:', bookingError);
        }

        // Create commission record
        const { data: payment } = await supabaseClient
          .from('payments')
          .select('id, master_id, commission_amount')
          .eq('booking_id', bookingId)
          .single();

        if (payment) {
          await supabaseClient
            .from('commissions')
            .insert({
              payment_id: payment.id,
              master_id: payment.master_id,
              amount: payment.commission_amount,
              percentage: 5.00,
              status: 'pending',
            });
        }

        console.log('Payment approved and booking confirmed:', bookingId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in mercadopago-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
