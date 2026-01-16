import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserSubscriptionRequest {
  action: 'cancel' | 'downgrade' | 'get_status';
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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
      case 'get_status':
        // Simplemente devolver el estado actual
        return new Response(
          JSON.stringify({
            success: true,
            subscription: {
              id: subscription.id,
              plan: subscription.plan,
              applications_used: subscription.applications_used,
              monthly_applications_limit: subscription.monthly_applications_limit,
              is_featured: subscription.is_featured,
              current_period_end: subscription.current_period_end,
              cancelled_at: subscription.cancelled_at,
              has_founder_discount: subscription.has_founder_discount,
              mercadopago_subscription_id: subscription.mercadopago_subscription_id ? true : false,
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'cancel':
        // Verificar que no sea plan gratuito
        if (subscription.plan === 'free') {
          return new Response(
            JSON.stringify({ error: "No puedes cancelar el plan gratuito" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancelar en MercadoPago si existe
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
              console.log("Successfully cancelled MercadoPago subscription");
            }
          } catch (mpError) {
            console.error("Error cancelling in MercadoPago:", mpError);
          }
        }

        // Actualizar en base de datos - degradar a plan gratuito al final del período
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

        // Notificar al usuario
        await supabaseAdmin.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_cancelled',
          title: 'Suscripción Cancelada',
          message: `Tu suscripción ${subscription.plan === 'basic_plus' ? 'Basic Plus' : 'Premium'} ha sido cancelada. Seguirás disfrutando de los beneficios hasta ${new Date(subscription.current_period_end).toLocaleDateString('es-CL')}.`,
        });

        result = { 
          message: "Suscripción cancelada exitosamente",
          effective_date: subscription.current_period_end,
          plan_after_cancel: 'free'
        };
        break;

      case 'downgrade':
        // Cambiar a plan gratuito inmediatamente
        if (subscription.plan === 'free') {
          return new Response(
            JSON.stringify({ error: "Ya tienes el plan gratuito" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancelar en MercadoPago si existe
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

        // Actualizar inmediatamente a plan gratuito
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
          title: 'Plan Cambiado',
          message: 'Tu suscripción ha sido cambiada al plan gratuito.',
        });

        result = { 
          message: "Plan cambiado a gratuito exitosamente",
          new_plan: 'free'
        };
        break;

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
