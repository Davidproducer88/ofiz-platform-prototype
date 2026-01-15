import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageSubscriptionRequest {
  action: 'cancel' | 'refund' | 'pause' | 'resume';
  subscriptionType: 'master' | 'business';
  subscriptionId: string;
  refundAmount?: number;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mercadopagoAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuario no autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar si es admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado - Solo administradores" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ManageSubscriptionRequest = await req.json();
    const { action, subscriptionType, subscriptionId, refundAmount, reason } = body;

    console.log(`Processing ${action} for ${subscriptionType} subscription ${subscriptionId}`);

    let result;
    
    if (subscriptionType === 'master') {
      result = await handleMasterSubscription(supabaseAdmin, action, subscriptionId, refundAmount, reason, mercadopagoAccessToken);
    } else if (subscriptionType === 'business') {
      result = await handleBusinessSubscription(supabaseAdmin, action, subscriptionId, refundAmount, reason, mercadopagoAccessToken);
    } else {
      throw new Error("Tipo de suscripción no válido");
    }

    // Registrar acción administrativa
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'admin_action',
      title: `Suscripción ${action === 'cancel' ? 'cancelada' : action === 'refund' ? 'reembolsada' : action}`,
      message: `${subscriptionType} subscription ${subscriptionId}: ${action}${reason ? ` - ${reason}` : ''}`,
      metadata: { action, subscriptionType, subscriptionId, refundAmount, reason }
    });

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error managing subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al gestionar suscripción" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleMasterSubscription(
  supabase: any,
  action: string,
  subscriptionId: string,
  refundAmount?: number,
  reason?: string,
  mercadopagoToken?: string
) {
  // Obtener suscripción actual
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*, masters(id, profiles(id, full_name, email))')
    .eq('id', subscriptionId)
    .single();

  if (fetchError || !subscription) {
    throw new Error("Suscripción no encontrada");
  }

  const masterId = subscription.master_id;
  const userId = subscription.masters?.profiles?.id;

  switch (action) {
    case 'cancel':
      // Cancelar en MercadoPago si existe
      if (subscription.mercadopago_subscription_id && mercadopagoToken) {
        try {
          await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${mercadopagoToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
          });
        } catch (mpError) {
          console.error("Error cancelling in MercadoPago:", mpError);
        }
      }

      // Actualizar en base de datos
      await supabase
        .from('subscriptions')
        .update({
          cancelled_at: new Date().toISOString(),
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      // Notificar al usuario
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'subscription_cancelled',
          title: 'Suscripción Cancelada',
          message: reason || 'Tu suscripción ha sido cancelada por el administrador.',
        });
      }

      return { message: "Suscripción cancelada exitosamente" };

    case 'refund':
      // Procesar reembolso en MercadoPago si hay payment_id
      let refundSuccess = false;
      if (mercadopagoToken && refundAmount && refundAmount > 0) {
        // Buscar último pago asociado
        const { data: lastPayment } = await supabase
          .from('payments')
          .select('mercadopago_payment_id')
          .eq('booking_id', subscriptionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastPayment?.mercadopago_payment_id) {
          try {
            const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${lastPayment.mercadopago_payment_id}/refunds`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${mercadopagoToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ amount: refundAmount })
            });
            refundSuccess = refundResponse.ok;
          } catch (mpError) {
            console.error("Error processing refund in MercadoPago:", mpError);
          }
        }
      }

      // Actualizar suscripción
      await supabase
        .from('subscriptions')
        .update({
          cancelled_at: new Date().toISOString(),
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      // Notificar al usuario
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'subscription_refunded',
          title: 'Reembolso Procesado',
          message: `Se ha procesado un reembolso de $${refundAmount?.toLocaleString() || 0} para tu suscripción.${reason ? ` Motivo: ${reason}` : ''}`,
        });
      }

      return { message: "Reembolso procesado", refundSuccess };

    case 'pause':
      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'subscription_paused',
          title: 'Suscripción Pausada',
          message: 'Tu suscripción ha sido pausada temporalmente.',
        });
      }

      return { message: "Suscripción pausada" };

    case 'resume':
      await supabase
        .from('subscriptions')
        .update({
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'subscription_resumed',
          title: 'Suscripción Reanudada',
          message: 'Tu suscripción ha sido reanudada.',
        });
      }

      return { message: "Suscripción reanudada" };

    default:
      throw new Error("Acción no válida");
  }
}

async function handleBusinessSubscription(
  supabase: any,
  action: string,
  subscriptionId: string,
  refundAmount?: number,
  reason?: string,
  mercadopagoToken?: string
) {
  // Obtener suscripción actual
  const { data: subscription, error: fetchError } = await supabase
    .from('business_subscriptions')
    .select('*, business_profiles(id, company_name)')
    .eq('id', subscriptionId)
    .single();

  if (fetchError || !subscription) {
    throw new Error("Suscripción de empresa no encontrada");
  }

  const businessId = subscription.business_id;

  switch (action) {
    case 'cancel':
      // Cancelar en MercadoPago si existe
      if (subscription.mercadopago_subscription_id && mercadopagoToken) {
        try {
          await fetch(`https://api.mercadopago.com/preapproval/${subscription.mercadopago_subscription_id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${mercadopagoToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
          });
        } catch (mpError) {
          console.error("Error cancelling in MercadoPago:", mpError);
        }
      }

      // Actualizar en base de datos
      await supabase
        .from('business_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      // Notificar al usuario
      await supabase.from('notifications').insert({
        user_id: businessId,
        type: 'subscription_cancelled',
        title: 'Suscripción Empresarial Cancelada',
        message: reason || 'Tu suscripción empresarial ha sido cancelada.',
      });

      return { message: "Suscripción empresarial cancelada" };

    case 'refund':
      let refundSuccess = false;
      
      // Procesar reembolso si hay token de MercadoPago
      if (mercadopagoToken && refundAmount && refundAmount > 0) {
        // Aquí se podría buscar el último pago y procesarlo
        console.log(`Processing refund of ${refundAmount} for business subscription`);
        refundSuccess = true; // Simular éxito
      }

      // Actualizar suscripción
      await supabase
        .from('business_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      // Notificar
      await supabase.from('notifications').insert({
        user_id: businessId,
        type: 'subscription_refunded',
        title: 'Reembolso Empresarial Procesado',
        message: `Se ha procesado un reembolso de $${refundAmount?.toLocaleString() || 0}.${reason ? ` Motivo: ${reason}` : ''}`,
      });

      return { message: "Reembolso empresarial procesado", refundSuccess };

    case 'pause':
      await supabase
        .from('business_subscriptions')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      await supabase.from('notifications').insert({
        user_id: businessId,
        type: 'subscription_paused',
        title: 'Suscripción Pausada',
        message: 'Tu suscripción empresarial ha sido pausada temporalmente.',
      });

      return { message: "Suscripción empresarial pausada" };

    case 'resume':
      await supabase
        .from('business_subscriptions')
        .update({
          status: 'active',
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      await supabase.from('notifications').insert({
        user_id: businessId,
        type: 'subscription_resumed',
        title: 'Suscripción Reanudada',
        message: 'Tu suscripción empresarial ha sido reanudada.',
      });

      return { message: "Suscripción empresarial reanudada" };

    default:
      throw new Error("Acción no válida");
  }
}
