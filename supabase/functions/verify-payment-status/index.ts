import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  paymentId: string;
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

    const { paymentId }: VerifyRequest = await req.json();

    if (!paymentId) {
      throw new Error('paymentId es requerido');
    }

    console.log('Verifying payment status for:', paymentId);

    // Get local payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*, bookings!inner(client_id, master_id)')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Pago no encontrado');
    }

    // Verify user has access to this payment
    if (payment.bookings.client_id !== user.id && payment.bookings.master_id !== user.id) {
      throw new Error('No tienes permiso para ver este pago');
    }

    // If we have a MercadoPago payment ID, verify with MercadoPago
    if (payment.mercadopago_payment_id) {
      const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${payment.mercadopago_payment_id}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadoPagoToken}`,
          },
        }
      );

      if (mpResponse.ok) {
        const mpData = await mpResponse.json();
        
        // Update local status if different
        let localStatus = payment.status;
        switch (mpData.status) {
          case 'approved':
            localStatus = 'approved';
            break;
          case 'pending':
          case 'in_process':
            localStatus = 'pending';
            break;
          case 'rejected':
          case 'cancelled':
          case 'refunded':
            localStatus = 'rejected';
            break;
        }

        if (localStatus !== payment.status) {
          console.log(`Updating payment status from ${payment.status} to ${localStatus}`);
          
          await supabaseClient
            .from('payments')
            .update({
              status: localStatus,
              payment_method: mpData.payment_method_id,
              metadata: {
                ...payment.metadata,
                last_verification: new Date().toISOString(),
                mp_status: mpData.status,
              }
            })
            .eq('id', paymentId);
        }

        return new Response(
          JSON.stringify({
            payment_id: paymentId,
            local_status: localStatus,
            mercadopago_status: mpData.status,
            mercadopago_detail: mpData.status_detail,
            amount: payment.amount,
            updated: localStatus !== payment.status,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // If no MercadoPago payment ID or verification failed, return local status
    return new Response(
      JSON.stringify({
        payment_id: paymentId,
        local_status: payment.status,
        amount: payment.amount,
        verified_with_mercadopago: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in verify-payment-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
