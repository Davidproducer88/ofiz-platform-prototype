import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  bookingId: string;
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

    const { bookingId, amount, title, description }: PaymentRequest = await req.json();

    // Validar datos de entrada
    if (!bookingId || !amount || !title) {
      throw new Error('Faltan datos requeridos: bookingId, amount, title');
    }

    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    console.log('Creating payment preference for booking:', bookingId);

    // Get booking details - usar maybeSingle en lugar de single para mejor manejo de errores
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        profiles!bookings_client_id_fkey(email)
      `)
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError) {
      console.error('Database error fetching booking:', bookingError);
      throw new Error(`Error al buscar reserva: ${bookingError.message}`);
    }

    if (!booking) {
      console.error('Booking not found:', bookingId);
      throw new Error('Reserva no encontrada. Verifica el ID de la reserva.');
    }

    console.log('Booking found:', {
      id: booking.id,
      client_id: booking.client_id,
      master_id: booking.master_id,
      total_price: booking.total_price,
      status: booking.status
    });

    // Create payment preference with Mercado Pago
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      throw new Error('Token de Mercado Pago no configurado');
    }

    // Obtener email del cliente
    const clientEmail = booking.profiles?.email || user.email;
    
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
        email: clientEmail,
      },
      back_urls: {
        success: `https://ofiz.com.uy/client-dashboard?payment=success&booking=${bookingId}`,
        failure: `https://ofiz.com.uy/client-dashboard?payment=failure&booking=${bookingId}`,
        pending: `https://ofiz.com.uy/client-dashboard?payment=pending&booking=${bookingId}`,
      },
      auto_return: 'approved' as const,
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      external_reference: bookingId,
      statement_descriptor: 'OFIZ SERVICIOS',
      metadata: {
        booking_id: bookingId,
        client_id: booking.client_id,
        master_id: booking.master_id,
      }
    };

    console.log('Sending preference to Mercado Pago');

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

    // Calculate commission (12% for services, included in the amount)
    const commissionRate = 0.12;
    const commissionAmount = parseFloat((amount * commissionRate).toFixed(2));
    const masterAmount = parseFloat((amount - commissionAmount).toFixed(2));

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        booking_id: bookingId,
        client_id: booking.client_id,
        master_id: booking.master_id,
        amount: amount,
        commission_amount: commissionAmount,
        master_amount: masterAmount,
        status: 'pending',
        mercadopago_preference_id: mpData.id,
        metadata: {
          preference_data: mpData,
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error(`Error al crear registro de pago: ${paymentError.message}`);
    }

    console.log('Payment record created:', payment.id);

    return new Response(
      JSON.stringify({ 
        preferenceId: mpData.id,
        initPoint: mpData.init_point,
        paymentId: payment.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-payment-preference:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
