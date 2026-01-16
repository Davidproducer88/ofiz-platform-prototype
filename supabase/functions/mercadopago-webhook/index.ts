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

              // Get order details
              const { data: order, error: fetchError } = await supabaseClient
                .from('marketplace_orders')
                .select('*')
                .eq('id', orderId)
                .single();

              if (fetchError || !order) {
                console.error('Error fetching order:', fetchError);
                continue;
              }

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
                
                // Create admin client with service role for system operations
                const supabaseAdmin = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );
                
                // Process post-payment updates
                // 1. Update product stock and sales
                const { data: product } = await supabaseAdmin
                  .from('marketplace_products')
                  .select('stock_quantity, sales_count')
                  .eq('id', order.product_id)
                  .single();

                if (product && product.stock_quantity >= order.quantity) {
                  await supabaseAdmin
                    .from('marketplace_products')
                    .update({
                      stock_quantity: product.stock_quantity - order.quantity,
                      sales_count: (product.sales_count || 0) + 1
                    })
                    .eq('id', order.product_id);
                }

                // 2. Update seller balance
                const { data: balance } = await supabaseAdmin
                  .from('marketplace_seller_balance')
                  .select('*')
                  .eq('seller_id', order.seller_id)
                  .single();

                if (balance) {
                  await supabaseAdmin
                    .from('marketplace_seller_balance')
                    .update({
                      total_earnings: Number(balance.total_earnings) + Number(order.seller_amount),
                      available_balance: Number(balance.available_balance) + Number(order.seller_amount)
                    })
                    .eq('seller_id', order.seller_id);
                } else {
                  await supabaseAdmin
                    .from('marketplace_seller_balance')
                    .insert({
                      seller_id: order.seller_id,
                      total_earnings: Number(order.seller_amount),
                      available_balance: Number(order.seller_amount)
                    });
                }

                // 3. Create transaction
                await supabaseAdmin
                  .from('marketplace_transactions')
                  .insert({
                    order_id: orderId,
                    transaction_type: 'sale',
                    amount: Number(order.total_amount),
                    platform_commission_amount: Number(order.platform_fee),
                    seller_net_amount: Number(order.seller_amount),
                    status: 'completed',
                    payment_provider: 'mercadopago',
                    payment_reference: payment.id.toString(),
                    processed_at: new Date().toISOString()
                  });

                // 4. Create notifications
                await supabaseAdmin.from('notifications').insert([
                  {
                    user_id: order.buyer_id,
                    type: 'marketplace_order_confirmed',
                    title: '✅ Pago confirmado',
                    message: `Tu pago fue aprobado. Orden #${order.order_number}`,
                    metadata: { order_id: orderId, payment_id: payment.id.toString() }
                  },
                  {
                    user_id: order.seller_id,
                    type: 'marketplace_new_sale',
                    title: '💰 Nueva venta',
                    message: `Nueva venta de $${Number(order.seller_amount).toLocaleString()}. Orden #${order.order_number}`,
                    metadata: { order_id: orderId, payment_id: payment.id.toString() }
                  }
                ]);
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
    
    // Handle regular payment events (bookings and marketplace)
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

      const externalReference = paymentData.external_reference;
      const status = paymentData.status;
      const metadata = paymentData.metadata || {};
      
      // Determine payment status
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

      // Check if it's a master subscription payment
      if (metadata.type === 'master_subscription') {
        console.log('Processing master subscription payment for:', externalReference);
        
        const masterId = metadata.master_id || externalReference.replace('sub-', '').replace(/-basic_plus|-basic|-pro|-premium/g, '');
        const planId = metadata.plan_id || 'basic_plus';
        const planName = metadata.plan_name || 'Basic Plus';
        
        console.log('Master ID:', masterId, 'Plan:', planId);
        
        if (status === 'approved') {
          // Check if subscription already exists
          const { data: existingSub } = await supabaseClient
            .from('subscriptions')
            .select('id')
            .eq('master_id', masterId)
            .maybeSingle();
          
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          
          if (existingSub) {
            // Update existing subscription - clear cancelled_at to reactivate
            const { error: updateError } = await supabaseClient
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
            
            if (updateError) {
              console.error('Error updating master subscription:', updateError);
              throw updateError;
            }
            console.log('Master subscription updated successfully:', masterId, planId);
          } else {
            // Create new subscription
            const { error: insertError } = await supabaseClient
              .from('subscriptions')
              .insert({
                master_id: masterId,
                plan: planId,
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: nextMonth.toISOString(),
                mercadopago_payment_id: paymentId.toString()
              });
            
            if (insertError) {
              console.error('Error creating master subscription:', insertError);
              throw insertError;
            }
            console.log('Master subscription created successfully:', masterId, planId);
          }
          
          // Create notification
          await supabaseClient.from('notifications').insert({
            user_id: masterId,
            type: 'subscription_activated',
            title: '🎉 ¡Suscripción activada!',
            message: `Tu plan ${planName} ha sido activado exitosamente.`,
            metadata: { plan_id: planId, payment_id: paymentId.toString() }
          });
        }
        
        return new Response(
          JSON.stringify({ received: true, type: 'master_subscription' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Check if it's a marketplace payment or booking payment
      if (metadata.type === 'marketplace') {
        console.log('Processing marketplace payment for order:', externalReference);
        
        // Get order details first
        const { data: order, error: fetchError } = await supabaseClient
          .from('marketplace_orders')
          .select('*')
          .eq('id', externalReference)
          .single();

        if (fetchError || !order) {
          console.error('Error fetching order:', fetchError);
          throw new Error('Order not found');
        }

        // Update order status
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

        if (orderError) {
          console.error('Error updating marketplace order:', orderError);
          throw orderError;
        }

        console.log('Marketplace order updated:', externalReference, status);

          // If payment approved, process all related updates
          if (status === 'approved') {
            console.log('Payment approved via webhook - processing updates...');

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
            const { data: existingBalance } = await supabaseClient
              .from('marketplace_seller_balance')
              .select('*')
              .eq('seller_id', order.seller_id)
              .single();

            if (existingBalance) {
              await supabaseClient
                .from('marketplace_seller_balance')
                .update({
                  total_earnings: Number(existingBalance.total_earnings) + Number(order.seller_amount),
                  available_balance: Number(existingBalance.available_balance) + Number(order.seller_amount),
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
                order_id: externalReference,
                transaction_type: 'sale',
                amount: Number(order.total_amount),
                platform_commission_amount: Number(order.platform_fee),
                seller_net_amount: Number(order.seller_amount),
                status: 'completed',
                payment_provider: 'mercadopago',
                payment_reference: paymentId.toString(),
                processed_at: new Date().toISOString()
              });

            // 4. Create notifications
            await supabaseClient.from('notifications').insert([
              {
                user_id: order.buyer_id,
                type: 'marketplace_order_confirmed',
                title: '✅ Pago confirmado',
                message: `Tu pago de $${Number(order.total_amount).toLocaleString()} fue aprobado. Orden #${order.order_number}`,
                metadata: {
                  order_id: externalReference,
                  payment_id: paymentId.toString(),
                  amount: Number(order.total_amount)
                }
              },
              {
                user_id: order.seller_id,
                type: 'marketplace_new_sale',
                title: '💰 Nueva venta',
                message: `Recibiste una nueva venta de $${Number(order.seller_amount).toLocaleString()}. Orden #${order.order_number}`,
                metadata: {
                  order_id: externalReference,
                  payment_id: paymentId.toString(),
                  amount: Number(order.seller_amount),
                  buyer_id: order.buyer_id
                }
              }
            ]);

            console.log('All webhook post-payment updates completed');
          }
      } else {
        // Regular booking payment
        console.log('Processing booking payment for:', externalReference);
        
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
          .eq('booking_id', externalReference);

        if (updateError) {
          console.error('Error updating payment:', updateError);
          throw updateError;
        }

        // Update booking status if payment approved
        if (status === 'approved') {
          const { error: bookingError } = await supabaseClient
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', externalReference);

          if (bookingError) {
            console.error('Error updating booking:', bookingError);
          }

          // Create commission record
          const { data: payment } = await supabaseClient
            .from('payments')
            .select('id, master_id, commission_amount')
            .eq('booking_id', externalReference)
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

          console.log('Payment approved and booking confirmed:', externalReference);
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
