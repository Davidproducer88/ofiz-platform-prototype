import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketplacePaymentRequest {
  orderId: string;
  amount?: number; // Optional, will use order.total_amount if not provided
  title: string;
  description: string;
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

    const { orderId, amount: clientAmount, title, description }: MarketplacePaymentRequest = await req.json();
    
    console.log('Request received:', { orderId, clientAmount, title, userId: user.id });

    // Validar datos de entrada
    if (!orderId || !title) {
      throw new Error('Faltan datos requeridos: orderId, title');
    }

    console.log('Creating marketplace payment preference for order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('marketplace_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      throw new Error('Orden no encontrada');
    }

    // Verify buyer
    if (order.buyer_id !== user.id) {
      console.error('Unauthorized access attempt:', { orderId, userId: user.id, buyerId: order.buyer_id });
      throw new Error('No autorizado para esta orden');
    }

    // Use order total_amount from database (calculated by trigger)
    const finalAmount = order.total_amount;

    if (!finalAmount || finalAmount <= 0) {
      console.error('Invalid order amount:', { orderId, totalAmount: order.total_amount });
      throw new Error('El monto de la orden es inválido');
    }

    console.log('Order details:', {
      orderId: order.id,
      buyer: order.buyer_id,
      seller: order.seller_id,
      totalAmount: finalAmount,
      subtotal: order.subtotal,
      platformFee: order.platform_fee,
      shippingCost: order.shipping_cost,
      status: order.status,
      paymentStatus: order.payment_status
    });

    // Create payment preference with Mercado Pago
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago no está configurado. Contacta al administrador.');
    }

    // Validate token format
    if (!mercadoPagoToken.startsWith('APP_USR-') && !mercadoPagoToken.startsWith('TEST-')) {
      console.error('Invalid MercadoPago token format');
      throw new Error('Token de MercadoPago inválido');
    }

    console.log('Using MercadoPago token type:', mercadoPagoToken.startsWith('TEST-') ? 'TEST' : 'PRODUCTION');

    const preference = {
      items: [
        {
          title: title,
          description: description || `Orden #${order.order_number}`,
          quantity: 1,
          unit_price: finalAmount,
          currency_id: 'UYU',
        }
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${req.headers.get('origin') || 'https://ofiz.com.uy'}/client-dashboard?marketplace_payment=success&order_id=${orderId}`,
        failure: `${req.headers.get('origin') || 'https://ofiz.com.uy'}/client-dashboard?marketplace_payment=failure&order_id=${orderId}`,
        pending: `${req.headers.get('origin') || 'https://ofiz.com.uy'}/client-dashboard?marketplace_payment=pending&order_id=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      external_reference: orderId,
      statement_descriptor: 'OFIZ MARKETPLACE',
      metadata: {
        order_id: orderId,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        type: 'marketplace'
      }
    };

    console.log('Sending preference to Mercado Pago for marketplace order');

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
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
      throw new Error(`Error de Mercado Pago: ${mpResponse.status} - ${errorData}`);
    }

    const mpData = await mpResponse.json();
    console.log('Mercado Pago preference created:', mpData.id);

    // Update order with preference ID
    const { error: updateError } = await supabaseClient
      .from('marketplace_orders')
      .update({
        mercadopago_preference_id: mpData.id,
        payment_status: 'pending'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order with preference:', updateError);
      throw updateError;
    }

    console.log('Order updated with preference ID');

    return new Response(
      JSON.stringify({ 
        preferenceId: mpData.id,
        initPoint: mpData.init_point,
        orderId: order.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-marketplace-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});