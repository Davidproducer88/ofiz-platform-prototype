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

    // Verificar que la notificación venga de MercadoPago
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    
    if (!xSignature || !xRequestId) {
      console.warn('Missing MercadoPago headers');
    }

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago token not configured');
    }

    // MercadoPago sends notifications in two formats:
    // 1. New format: { type, data: { id } }
    // 2. Old format: { topic, resource }
    
    // Handle old format (merchant_order, payment)
    if (body.topic && body.resource) {
      const topic = body.topic;
      const resourceUrl = body.resource;
      
      console.log('Processing old format notification:', { topic, resourceUrl });

      // Handle merchant_order (marketplace payments)
      if (topic === 'merchant_order') {
        console.log('Fetching merchant order from:', resourceUrl);
        
        const mpResponse = await fetch(resourceUrl, {
          headers: {
            'Authorization': `Bearer ${mercadoPagoToken}`,
          },
        });

        if (!mpResponse.ok) {
          throw new Error(`Error fetching merchant order: ${mpResponse.status}`);
        }

        const merchantOrder = await mpResponse.json();
        console.log('Merchant order data:', JSON.stringify(merchantOrder));

        // Process payments in the merchant order
        if (merchantOrder.payments && merchantOrder.payments.length > 0) {
          for (const payment of merchantOrder.payments) {
            if (payment.status === 'approved') {
              const orderId = merchantOrder.external_reference;
              
              console.log('Processing approved payment for order:', orderId);

              // Update marketplace order
              const { error: orderError } = await supabaseClient
                .from('marketplace_orders')
                .update({
                  payment_status: 'paid',
                  status: 'confirmed',
                  payment_method: payment.payment_type,
                  mercadopago_payment_id: payment.id.toString(),
                  confirmed_at: new Date().toISOString()
                })
                .eq('id', orderId);

              if (orderError) {
                console.error('Error updating marketplace order:', orderError);
              } else {
                console.log('Marketplace order updated successfully:', orderId);
              }
            }
          }
        }

        return new Response(
          JSON.stringify({ received: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Validar que body contenga los campos necesarios para el formato nuevo
    if (!body || !body.type || !body.data || !body.data.id) {
      console.error('Invalid webhook payload - missing required fields');
      return new Response(
        JSON.stringify({ received: true }), // Return 200 to avoid retries
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Mercado Pago sends notifications for different events
    
    // Handle subscription events
    if (body.type === 'subscription_preapproval' || body.type === 'subscription_authorized_payment') {
      const preapprovalId = body.data.id;
      console.log('Processing subscription notification for:', preapprovalId);
      
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

      const userId = subscriptionData.external_reference;
      const status = subscriptionData.status;
      const metadata = subscriptionData.metadata || {};

      // Determine subscription status
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

      // Check if it's a business or master subscription based on metadata or by checking both tables
      const { data: businessSub } = await supabaseClient
        .from('business_subscriptions')
        .select('id')
        .eq('business_id', userId)
        .eq('mercadopago_subscription_id', preapprovalId)
        .maybeSingle();

      if (businessSub) {
        // Update business subscription
        const { error: updateError } = await supabaseClient
          .from('business_subscriptions')
          .update({
            status: subscriptionStatus,
          })
          .eq('id', businessSub.id);

        if (updateError) {
          console.error('Error updating business subscription:', updateError);
          throw updateError;
        }

        console.log('Business subscription updated:', userId, subscriptionStatus);
      } else {
        // Update master subscription
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            plan: metadata.plan_id || 'premium',
          })
          .eq('master_id', userId)
          .eq('mercadopago_subscription_id', preapprovalId);

        if (updateError) {
          console.error('Error updating master subscription:', updateError);
          throw updateError;
        }

        console.log('Master subscription updated:', userId, subscriptionStatus);
      }
    }
    
    // Handle regular payment events (bookings)
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log('Processing payment notification for:', paymentId);
      
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
          paymentStatus = 'approved'; // Cambiar a approved, el escrow se maneja por separado
          break;
        case 'pending':
        case 'in_process':
          paymentStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
        case 'refunded':
        case 'charged_back':
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
              percentage: 12.00,
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
