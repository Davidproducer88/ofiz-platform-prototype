import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: track requests per IP
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// HMAC signature verification for MercadoPago webhooks
async function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  webhookSecret: string | null
): Promise<boolean> {
  if (!xSignature || !xRequestId || !webhookSecret) {
    return false;
  }

  try {
    // Parse x-signature header: "ts=xxx,v1=xxx"
    const parts: Record<string, string> = {};
    xSignature.split(',').forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key && value) parts[key] = value;
    });

    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    // Build the manifest string as per MercadoPago docs
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Create HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hex === v1;
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientIp)) {
    console.warn('Rate limited IP:', clientIp);
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Received webhook notification:', JSON.stringify(body));

    // Signature verification
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const webhookSecret = Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET');

    if (webhookSecret) {
      const dataId = body?.data?.id?.toString() || '';
      const isValid = await verifyWebhookSignature(xSignature, xRequestId, dataId, webhookSecret);
      if (!isValid) {
        console.warn('Invalid webhook signature - rejecting. IP:', clientIp);
        // Still return 200 to avoid MercadoPago retries, but don't process
        return new Response(
          JSON.stringify({ received: true, processed: false, reason: 'invalid_signature' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('MERCADO_PAGO_WEBHOOK_SECRET not configured - signature verification skipped');
    }

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago token not configured');
    }

    // Handle old format (merchant_order, payment)
    if (body.topic && body.resource) {
      const topic = body.topic;
      const resourceUrl = body.resource;
      
      console.log('Processing old format notification:', { topic, resourceUrl });

      if (topic === 'merchant_order') {
        console.log('Fetching merchant order from:', resourceUrl);
        
        const mpResponse = await fetch(resourceUrl, {
          headers: { 'Authorization': `Bearer ${mercadoPagoToken}` },
        });

        if (!mpResponse.ok) {
          throw new Error(`Error fetching merchant order: ${mpResponse.status}`);
        }

        const merchantOrder = await mpResponse.json();
        console.log('Merchant order data:', JSON.stringify(merchantOrder));

        if (merchantOrder.payments && merchantOrder.payments.length > 0) {
          for (const payment of merchantOrder.payments) {
            if (payment.status === 'approved') {
              const orderId = merchantOrder.external_reference;
              console.log('Processing approved payment for order:', orderId);

              const { data: order, error: fetchError } = await supabaseClient
                .from('marketplace_orders')
                .select('*')
                .eq('id', orderId)
                .single();

              if (fetchError || !order) {
                console.error('Error fetching order:', fetchError);
                continue;
              }

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
                await processPostPaymentUpdates(supabaseClient, order, orderId, payment.id.toString());
              }
            }
          }
        }

        return new Response(
          JSON.stringify({ received: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Validate new format
    if (!body || !body.type || !body.data || !body.data.id) {
      console.error('Invalid webhook payload - missing required fields');
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Handle subscription events
    if (body.type === 'subscription_preapproval' || body.type === 'subscription_authorized_payment') {
      await processSubscriptionEvent(supabaseClient, body.data.id, mercadoPagoToken);
    }
    
    // Handle regular payment events
    if (body.type === 'payment') {
      await processPaymentEvent(supabaseClient, body.data.id, mercadoPagoToken);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in mercadopago-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// ---- Helper Functions ----

async function processPostPaymentUpdates(
  supabaseClient: any,
  order: any,
  orderId: string,
  paymentIdStr: string
) {
  // 1. Update product stock and sales
  const { data: product } = await supabaseClient
    .from('marketplace_products')
    .select('stock_quantity, sales_count')
    .eq('id', order.product_id)
    .single();

  if (product && product.stock_quantity >= order.quantity) {
    await supabaseClient
      .from('marketplace_products')
      .update({
        stock_quantity: product.stock_quantity - order.quantity,
        sales_count: (product.sales_count || 0) + 1
      })
      .eq('id', order.product_id);
  }

  // 2. Update seller balance
  const { data: balance } = await supabaseClient
    .from('marketplace_seller_balance')
    .select('*')
    .eq('seller_id', order.seller_id)
    .single();

  if (balance) {
    await supabaseClient
      .from('marketplace_seller_balance')
      .update({
        total_earnings: Number(balance.total_earnings) + Number(order.seller_amount),
        available_balance: Number(balance.available_balance) + Number(order.seller_amount),
        updated_at: new Date().toISOString()
      })
      .eq('seller_id', order.seller_id);
  } else {
    await supabaseClient
      .from('marketplace_seller_balance')
      .insert({
        seller_id: order.seller_id,
        total_earnings: Number(order.seller_amount),
        available_balance: Number(order.seller_amount)
      });
  }

  // 3. Create transaction
  await supabaseClient
    .from('marketplace_transactions')
    .insert({
      order_id: orderId,
      transaction_type: 'sale',
      amount: Number(order.total_amount),
      platform_commission_amount: Number(order.platform_fee),
      seller_net_amount: Number(order.seller_amount),
      status: 'completed',
      payment_provider: 'mercadopago',
      payment_reference: paymentIdStr,
      processed_at: new Date().toISOString()
    });

  // 4. Create notifications
  await supabaseClient.from('notifications').insert([
    {
      user_id: order.buyer_id,
      type: 'marketplace_order_confirmed',
      title: '✅ Pago confirmado',
      message: `Tu pago de $${Number(order.total_amount).toLocaleString()} fue aprobado. Orden #${order.order_number}`,
      metadata: { order_id: orderId, payment_id: paymentIdStr, amount: Number(order.total_amount) }
    },
    {
      user_id: order.seller_id,
      type: 'marketplace_new_sale',
      title: '💰 Nueva venta',
      message: `Recibiste una nueva venta de $${Number(order.seller_amount).toLocaleString()}. Orden #${order.order_number}`,
      metadata: { order_id: orderId, payment_id: paymentIdStr, amount: Number(order.seller_amount) }
    }
  ]);

  console.log('All post-payment updates completed for order:', orderId);
}

async function processSubscriptionEvent(supabaseClient: any, preapprovalId: string, token: string) {
  console.log('Processing subscription notification for:', preapprovalId);

  const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!mpResponse.ok) {
    throw new Error(`Error fetching subscription: ${mpResponse.status}`);
  }

  const subscriptionData = await mpResponse.json();
  console.log('Subscription data:', JSON.stringify(subscriptionData));

  const userId = subscriptionData.external_reference;
  const status = subscriptionData.status;
  const metadata = subscriptionData.metadata || {};

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

  const { data: businessSub } = await supabaseClient
    .from('business_subscriptions')
    .select('id')
    .eq('business_id', userId)
    .eq('mercadopago_subscription_id', preapprovalId)
    .maybeSingle();

  if (businessSub) {
    const { error } = await supabaseClient
      .from('business_subscriptions')
      .update({ status: subscriptionStatus })
      .eq('id', businessSub.id);
    if (error) throw error;
    console.log('Business subscription updated:', userId, subscriptionStatus);
  } else {
    const { error } = await supabaseClient
      .from('subscriptions')
      .update({ plan: metadata.plan_id || 'premium' })
      .eq('master_id', userId)
      .eq('mercadopago_subscription_id', preapprovalId);
    if (error) throw error;
    console.log('Master subscription updated:', userId, subscriptionStatus);
  }
}

async function processPaymentEvent(supabaseClient: any, paymentId: string, token: string) {
  console.log('Processing payment notification for:', paymentId);

  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!mpResponse.ok) {
    throw new Error(`Error fetching payment: ${mpResponse.status}`);
  }

  const paymentData = await mpResponse.json();
  console.log('Payment data:', JSON.stringify(paymentData));

  const externalReference = paymentData.external_reference;
  const status = paymentData.status;
  const metadata = paymentData.metadata || {};

  let paymentStatus: string;
  switch (status) {
    case 'approved':
      paymentStatus = 'approved';
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

  // Master subscription payment
  if (metadata.type === 'master_subscription') {
    await processMasterSubscriptionPayment(supabaseClient, paymentData, paymentId);
    return;
  }

  // Marketplace payment
  if (metadata.type === 'marketplace') {
    await processMarketplacePayment(supabaseClient, paymentData, paymentId, paymentStatus);
    return;
  }

  // Regular booking payment
  console.log('Processing booking payment for:', externalReference);

  const { error: updateError } = await supabaseClient
    .from('payments')
    .update({
      status: paymentStatus,
      mercadopago_payment_id: paymentId,
      payment_method: paymentData.payment_method_id,
      metadata: { payment_data: paymentData }
    })
    .eq('booking_id', externalReference);

  if (updateError) {
    console.error('Error updating payment:', updateError);
    throw updateError;
  }

  if (status === 'approved') {
    const { error: bookingError } = await supabaseClient
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', externalReference);

    if (bookingError) console.error('Error updating booking:', bookingError);

    // Create commission record
    const { data: payment } = await supabaseClient
      .from('payments')
      .select('id, master_id, commission_amount')
      .eq('booking_id', externalReference)
      .single();

    if (payment) {
      await supabaseClient.from('commissions').insert({
        payment_id: payment.id,
        master_id: payment.master_id,
        amount: payment.commission_amount,
        percentage: 5.00,
        status: 'pending',
      });

      // Send emails
      try {
        const emailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`;
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

        await fetch(emailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}` },
          body: JSON.stringify({ type: 'booking_confirmation', bookingId: externalReference, recipientRole: 'both' }),
        });

        await fetch(emailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}` },
          body: JSON.stringify({ type: 'payment_receipt', bookingId: externalReference, paymentId: payment.id }),
        });

        console.log('Confirmation and receipt emails sent');
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
      }
    }

    console.log('Payment approved and booking confirmed:', externalReference);
  }
}

async function processMasterSubscriptionPayment(supabaseClient: any, paymentData: any, paymentId: string) {
  const metadata = paymentData.metadata || {};
  const externalReference = paymentData.external_reference;
  const status = paymentData.status;

  const masterId = metadata.master_id || externalReference.replace('sub-', '').replace(/-basic_plus|-basic|-pro|-premium/g, '');
  const planId = metadata.plan_id || 'basic_plus';
  const planName = metadata.plan_name || 'Basic Plus';

  console.log('Processing master subscription payment. Master:', masterId, 'Plan:', planId);

  if (status === 'approved') {
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('master_id', masterId)
      .maybeSingle();

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (existingSub) {
      const { error } = await supabaseClient
        .from('subscriptions')
        .update({
          plan: planId,
          status: 'active',
          cancelled_at: null,
          current_period_start: now.toISOString(),
          current_period_end: nextMonth.toISOString(),
          mercadopago_payment_id: paymentId.toString(),
          updated_at: now.toISOString()
        })
        .eq('master_id', masterId);
      if (error) throw error;
    } else {
      const { error } = await supabaseClient
        .from('subscriptions')
        .insert({
          master_id: masterId,
          plan: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: nextMonth.toISOString(),
          mercadopago_payment_id: paymentId.toString()
        });
      if (error) throw error;
    }

    await supabaseClient.from('notifications').insert({
      user_id: masterId,
      type: 'subscription_activated',
      title: '🎉 ¡Suscripción activada!',
      message: `Tu plan ${planName} ha sido activado exitosamente.`,
      metadata: { plan_id: planId, payment_id: paymentId.toString() }
    });

    console.log('Master subscription activated:', masterId, planId);
  }
}

async function processMarketplacePayment(supabaseClient: any, paymentData: any, paymentId: string, paymentStatus: string) {
  const externalReference = paymentData.external_reference;
  const status = paymentData.status;

  console.log('Processing marketplace payment for order:', externalReference);

  const { data: order, error: fetchError } = await supabaseClient
    .from('marketplace_orders')
    .select('*')
    .eq('id', externalReference)
    .single();

  if (fetchError || !order) {
    console.error('Error fetching order:', fetchError);
    throw new Error('Order not found');
  }

  const { error: orderError } = await supabaseClient
    .from('marketplace_orders')
    .update({
      payment_status: status === 'approved' ? 'paid' : 'pending',
      status: status === 'approved' ? 'confirmed' : 'pending',
      payment_method: paymentData.payment_method_id,
      mercadopago_payment_id: paymentId.toString(),
      confirmed_at: status === 'approved' ? new Date().toISOString() : null
    })
    .eq('id', externalReference);

  if (orderError) throw orderError;

  if (status === 'approved') {
    await processPostPaymentUpdates(supabaseClient, order, externalReference, paymentId.toString());
  }
}
