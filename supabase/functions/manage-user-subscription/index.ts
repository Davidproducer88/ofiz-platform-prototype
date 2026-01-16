import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserSubscriptionRequest {
  action: 'cancel' | 'cancel_with_refund' | 'downgrade' | 'reactivate' | 'get_status';
  reason?: string;
}

interface RefundResult {
  success: boolean;
  refund_amount?: number;
  refund_id?: string;
  error?: string;
}

// Calculate pro-rata refund based on days remaining
function calculateProRataRefund(
  periodStart: string,
  periodEnd: string,
  totalAmount: number
): { refundAmount: number; daysRemaining: number; totalDays: number } {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const now = new Date();
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysUsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysUsed);
  
  // Calculate pro-rata refund (round to 2 decimals)
  const refundAmount = Math.round((totalAmount * daysRemaining / totalDays) * 100) / 100;
  
  return { refundAmount, daysRemaining, totalDays };
}

// Request refund from MercadoPago
async function requestMercadoPagoRefund(
  paymentId: string,
  amount: number,
  accessToken: string
): Promise<RefundResult> {
  try {
    console.log(`Requesting refund for payment ${paymentId}, amount: ${amount}`);
    
    // First, get the payment to check if it can be refunded
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Error fetching payment:', errorText);
      return { success: false, error: 'No se pudo obtener el pago original' };
    }
    
    const paymentData = await paymentResponse.json();
    console.log('Payment status:', paymentData.status);
    
    // Check if payment is refundable
    if (paymentData.status !== 'approved') {
      return { success: false, error: 'El pago no está aprobado y no se puede reembolsar' };
    }
    
    // Check if already refunded
    if (paymentData.status === 'refunded' || paymentData.transaction_amount_refunded > 0) {
      return { success: false, error: 'El pago ya fue reembolsado parcial o totalmente' };
    }
    
    // Request partial or full refund
    const refundBody = amount < paymentData.transaction_amount 
      ? { amount } // Partial refund
      : {}; // Full refund
    
    const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundBody),
    });
    
    if (!refundResponse.ok) {
      const errorData = await refundResponse.json();
      console.error('Refund error:', errorData);
      return { 
        success: false, 
        error: errorData.message || 'Error al procesar el reembolso en MercadoPago' 
      };
    }
    
    const refundData = await refundResponse.json();
    console.log('Refund successful:', refundData);
    
    return {
      success: true,
      refund_amount: refundData.amount,
      refund_id: refundData.id?.toString(),
    };
    
  } catch (error) {
    console.error('Error requesting refund:', error);
    return { success: false, error: error.message || 'Error de conexión con MercadoPago' };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mercadopagoAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuario no autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ManageUserSubscriptionRequest = await req.json();
    const { action, reason } = body;

    console.log(`User ${user.id} requesting ${action} for their subscription`);

    // Obtener suscripción del usuario
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('master_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching subscription:", fetchError);
      throw new Error("Error al obtener la suscripción");
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: "No tienes una suscripción activa" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    if (subscription.master_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para gestionar esta suscripción" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case 'get_status': {
        // Calcular reembolso potencial si aplica
        let potentialRefund = null;
        if (subscription.plan !== 'free' && subscription.mercadopago_payment_id && subscription.price) {
          const priceInCurrency = Number(subscription.price) / 100; // Convert from cents
          const refundCalc = calculateProRataRefund(
            subscription.current_period_start,
            subscription.current_period_end,
            priceInCurrency
          );
          potentialRefund = {
            amount: refundCalc.refundAmount,
            days_remaining: refundCalc.daysRemaining,
            total_days: refundCalc.totalDays,
          };
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            subscription: {
              id: subscription.id,
              plan: subscription.plan,
              applications_used: subscription.applications_used,
              monthly_applications_limit: subscription.monthly_applications_limit,
              is_featured: subscription.is_featured,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancelled_at: subscription.cancelled_at,
              has_founder_discount: subscription.has_founder_discount,
              mercadopago_payment_id: subscription.mercadopago_payment_id ? true : false,
              price: subscription.price,
            },
            potential_refund: potentialRefund,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'cancel': {
        // Cancelar sin reembolso - mantiene beneficios hasta fin del período
        if (subscription.plan === 'free') {
          return new Response(
            JSON.stringify({ error: "No puedes cancelar el plan gratuito" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancelar suscripción recurrente en MercadoPago si existe
        if (subscription.mercadopago_subscription_id && mercadopagoAccessToken) {
          try {
            console.log(`Cancelling MercadoPago subscription: ${subscription.mercadopago_subscription_id}`);
            const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${mercadopagoAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'cancelled' })
            });
            
            if (!mpResponse.ok) {
              const mpError = await mpResponse.text();
              console.error("MercadoPago cancellation error:", mpError);
            } else {
              console.log("Successfully cancelled MercadoPago recurring subscription");
            }
          } catch (mpError) {
            console.error("Error cancelling in MercadoPago:", mpError);
          }
        }

        // Marcar como cancelado pero mantener beneficios
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw new Error("Error al cancelar la suscripción");
        }

        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_cancelled',
          title: '📅 Suscripción programada para cancelar',
          message: `Tu plan ${subscription.plan === 'basic_plus' ? 'Basic Plus' : 'Premium'} se cancelará el ${new Date(subscription.current_period_end).toLocaleDateString('es-CL')}. Seguirás disfrutando los beneficios hasta esa fecha.`,
        });

        result = { 
          message: "Suscripción cancelada exitosamente. Mantendrás los beneficios hasta el fin del período.",
          effective_date: subscription.current_period_end,
          plan_after_cancel: 'free',
          refund: null,
        };
        break;
      }

      case 'cancel_with_refund': {
        // Cancelar con reembolso proporcional inmediato
        if (subscription.plan === 'free') {
          return new Response(
            JSON.stringify({ error: "No puedes cancelar el plan gratuito" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!mercadopagoAccessToken) {
          return new Response(
            JSON.stringify({ error: "No se puede procesar el reembolso: configuración de pago no disponible" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!subscription.mercadopago_payment_id) {
          return new Response(
            JSON.stringify({ error: "No se encontró el pago asociado a esta suscripción" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate pro-rata refund
        const priceInCurrency = Number(subscription.price) / 100;
        const refundCalc = calculateProRataRefund(
          subscription.current_period_start,
          subscription.current_period_end,
          priceInCurrency
        );

        console.log(`Calculated refund: ${refundCalc.refundAmount} for ${refundCalc.daysRemaining}/${refundCalc.totalDays} days`);

        // Request refund from MercadoPago
        const refundResult = await requestMercadoPagoRefund(
          subscription.mercadopago_payment_id,
          refundCalc.refundAmount,
          mercadopagoAccessToken
        );

        if (!refundResult.success) {
          console.error("Refund failed:", refundResult.error);
          return new Response(
            JSON.stringify({ 
              error: `No se pudo procesar el reembolso: ${refundResult.error}`,
              refund_error: true 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancel recurring subscription if exists
        if (subscription.mercadopago_subscription_id) {
          try {
            await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${mercadopagoAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'cancelled' })
            });
          } catch (mpError) {
            console.error("Error cancelling recurring in MercadoPago:", mpError);
          }
        }

        // Update subscription to free immediately
        const { error: downgradeError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            monthly_applications_limit: 5,
            is_featured: false,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (downgradeError) {
          console.error("Error downgrading subscription:", downgradeError);
          // Refund was processed but DB update failed - log this critical issue
          console.error("CRITICAL: Refund processed but subscription not updated!");
        }

        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_refunded',
          title: '💰 Reembolso procesado',
          message: `Tu suscripción fue cancelada y se te reembolsaron $${refundResult.refund_amount?.toLocaleString('es-UY')} UYU (${refundCalc.daysRemaining} días restantes).`,
          metadata: {
            refund_amount: refundResult.refund_amount,
            refund_id: refundResult.refund_id,
            days_remaining: refundCalc.daysRemaining,
          }
        });

        result = { 
          message: "Suscripción cancelada y reembolso procesado exitosamente",
          refund: {
            amount: refundResult.refund_amount,
            refund_id: refundResult.refund_id,
            days_remaining: refundCalc.daysRemaining,
          },
          new_plan: 'free',
        };
        break;
      }

      case 'downgrade': {
        // Cambiar a plan gratuito inmediatamente sin reembolso
        if (subscription.plan === 'free') {
          return new Response(
            JSON.stringify({ error: "Ya tienes el plan gratuito" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancel recurring in MercadoPago if exists
        if (subscription.mercadopago_subscription_id && mercadopagoAccessToken) {
          try {
            await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${mercadopagoAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'cancelled' })
            });
          } catch (mpError) {
            console.error("Error cancelling in MercadoPago:", mpError);
          }
        }

        // Update to free plan immediately
        const { error: downgradeError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            monthly_applications_limit: 5,
            is_featured: false,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (downgradeError) {
          console.error("Error downgrading subscription:", downgradeError);
          throw new Error("Error al cambiar al plan gratuito");
        }

        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_downgraded',
          title: '📉 Plan cambiado',
          message: 'Tu suscripción ha sido cambiada al plan gratuito sin reembolso.',
        });

        result = { 
          message: "Plan cambiado a gratuito exitosamente (sin reembolso)",
          new_plan: 'free',
        };
        break;
      }

      case 'reactivate': {
        // Reactivar suscripción cancelada (antes del fin del período)
        if (!subscription.cancelled_at) {
          return new Response(
            JSON.stringify({ error: "Tu suscripción no está cancelada" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const periodEnd = new Date(subscription.current_period_end);
        if (periodEnd < new Date()) {
          return new Response(
            JSON.stringify({ error: "El período de tu suscripción ya terminó. Debes suscribirte nuevamente." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Reactivate subscription
        const { error: reactivateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            cancelled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (reactivateError) {
          console.error("Error reactivating subscription:", reactivateError);
          throw new Error("Error al reactivar la suscripción");
        }

        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_reactivated',
          title: '✅ Suscripción reactivada',
          message: `Tu plan ${subscription.plan === 'basic_plus' ? 'Basic Plus' : 'Premium'} ha sido reactivado.`,
        });

        result = { 
          message: "¡Tu suscripción ha sido reactivada!",
          plan: subscription.plan,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Acción no válida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error managing user subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al gestionar suscripción" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
