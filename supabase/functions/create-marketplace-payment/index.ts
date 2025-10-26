import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketplacePaymentRequest {
  orderId: string;
  amount: number;
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
    if (!user) {
      throw new Error('No autenticado');
    }

    const { orderId, amount, title, description }: MarketplacePaymentRequest = await req.json();

    // Validar datos de entrada
    if (!orderId || !amount || !title) {
      throw new Error('Faltan datos requeridos: orderId, amount, title');
    }

    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    console.log('Creating marketplace payment preference for order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('marketplace_orders')
      .select(`
        *,
        profiles!buyer_id(email),
        marketplace_products!product_id(title, business_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      throw new Error('Orden no encontrada');
    }

    // Verify buyer
    if (order.buyer_id !== user.id) {
      throw new Error('No autorizado para esta orden');
    }

    console.log('Order details:', {
      orderId: order.id,
      buyer: order.buyer_id,
      seller: order.seller_id,
      amount: order.total_amount
    });

    // Create payment preference with Mercado Pago
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      throw new Error('MercadoPago token no configurado');
    }

    const preference = {
      items: [
        {
          title: title,
          description: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'UYU',
        }
      ],
      payer: {
        email: order.profiles.email,
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