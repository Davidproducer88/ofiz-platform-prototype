import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketplacePaymentRequest {
  orderId: string;
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

    const { orderId, paymentMethodId, token, issuerId, installments, payer }: MarketplacePaymentRequest = await req.json();
    
    console.log('Bricks payment request received:', { 
      orderId, 
      paymentMethodId, 
      hasToken: !!token,
      userId: user.id 
    });

    if (!orderId) {
      throw new Error('orderId es requerido');
    }

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
      shippingCost: order.shipping_cost
    });

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago no está configurado');
    }

    console.log('Using MercadoPago token type:', mercadoPagoToken.startsWith('TEST-') ? 'TEST' : 'PRODUCTION');

    // Create payment using Bricks API
    const paymentData = {
      transaction_amount: finalAmount,
      token: token,
      description: `Orden #${order.order_number}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payer?.email || user.email,
        identification: payer?.identification,
      },
      external_reference: orderId,
      statement_descriptor: 'OFIZ MARKETPLACE',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        order_id: orderId,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        type: 'marketplace'
      }
    };

    console.log('Creating payment with Bricks API');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': orderId,
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

    // Update order with payment info
    const { error: updateError } = await supabaseClient
      .from('marketplace_orders')
      .update({
        mercadopago_payment_id: paymentResult.id.toString(),
        payment_status: paymentResult.status === 'approved' ? 'approved' : 'pending',
        payment_method: paymentResult.payment_method_id,
        status: paymentResult.status === 'approved' ? 'confirmed' : 'pending',
        confirmed_at: paymentResult.status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated with payment info');

    // If payment is approved, process all related updates
    if (paymentResult.status === 'approved') {
        console.log('Payment approved - processing post-payment updates...');

      // 1. Update product stock and sales count
      const { data: product } = await supabaseClient
        .from('marketplace_products')
        .select('stock_quantity, sales_count')
        .eq('id', order.product_id)
        .single();

      if (product && product.stock_quantity >= order.quantity) {
        const { error: productError } = await supabaseClient
          .from('marketplace_products')
          .update({
            stock_quantity: product.stock_quantity - order.quantity,
            sales_count: (product.sales_count || 0) + 1
          })
          .eq('id', order.product_id);
        
        if (productError) {
          console.error('Error updating product:', productError);
        } else {
          console.log('Product stock and sales count updated');
        }
      } else {
        console.warn('Insufficient stock or product not found');
      }

      // 2. Update or create seller balance
      const { data: existingBalance } = await supabaseClient
        .from('marketplace_seller_balance')
        .select('*')
        .eq('seller_id', order.seller_id)
        .single();

      if (existingBalance) {
        const { error: balanceError } = await supabaseClient
          .from('marketplace_seller_balance')
          .update({
            total_earnings: Number(existingBalance.total_earnings) + Number(order.seller_amount),
            available_balance: Number(existingBalance.available_balance) + Number(order.seller_amount),
            updated_at: new Date().toISOString()
          })
          .eq('seller_id', order.seller_id);
        
        if (balanceError) {
          console.error('Error updating balance:', balanceError);
        }
      } else {
        const { error: balanceError } = await supabaseClient
          .from('marketplace_seller_balance')
          .insert({
            seller_id: order.seller_id,
            total_earnings: Number(order.seller_amount),
            available_balance: Number(order.seller_amount)
          });
        
        if (balanceError) {
          console.error('Error creating balance:', balanceError);
        }
      }
      
      console.log('Seller balance updated');

      // 3. Create transaction record
      const { error: transactionError } = await supabaseClient
        .from('marketplace_transactions')
        .insert({
          order_id: orderId,
          transaction_type: 'sale',
          amount: Number(order.total_amount),
          platform_commission_amount: Number(order.platform_fee),
          seller_net_amount: Number(order.seller_amount),
          status: 'completed',
          payment_provider: 'mercadopago',
          payment_reference: paymentResult.id.toString(),
          processed_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      } else {
        console.log('Transaction record created');
      }

      // 4. Create notifications for buyer
      const { error: buyerNotifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: order.buyer_id,
          type: 'marketplace_order_confirmed',
          title: '✅ Pago confirmado',
          message: `Tu pago de $${Number(order.total_amount).toLocaleString()} fue aprobado. Orden #${order.order_number}`,
          metadata: {
            order_id: orderId,
            payment_id: paymentResult.id.toString(),
            amount: Number(order.total_amount)
          }
        });

      if (buyerNotifError) {
        console.error('Error creating buyer notification:', buyerNotifError);
      }

      // 5. Create notification for seller
      const { error: sellerNotifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: order.seller_id,
          type: 'marketplace_new_sale',
          title: '💰 Nueva venta',
          message: `Recibiste una nueva venta de $${Number(order.seller_amount).toLocaleString()}. Orden #${order.order_number}`,
          metadata: {
            order_id: orderId,
            payment_id: paymentResult.id.toString(),
            amount: Number(order.seller_amount),
            buyer_id: order.buyer_id
          }
        });

      if (sellerNotifError) {
        console.error('Error creating seller notification:', sellerNotifError);
      }

      console.log('All post-payment updates completed');
    }

    return new Response(
      JSON.stringify({ 
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
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