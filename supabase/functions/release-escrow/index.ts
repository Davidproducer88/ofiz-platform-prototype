import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReleaseRequest {
  bookingId: string;
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

    const { bookingId }: ReleaseRequest = await req.json();

    console.log('Releasing escrow for booking:', bookingId);

    // Verify booking is completed
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('status', 'completed')
      .single();

    if (bookingError || !booking) {
      throw new Error('La reserva debe estar completada para liberar fondos');
    }

    // Check if user is the client
    if (booking.client_id !== user.id) {
      throw new Error('Solo el cliente puede liberar los fondos');
    }

    // Verificar que el pago esté aprobado
    const { data: existingPayment, error: checkError } = await supabaseClient
      .from('payments')
      .select('id, status')
      .eq('booking_id', bookingId)
      .single();

    if (checkError || !existingPayment) {
      throw new Error('No se encontró el pago para esta reserva');
    }

    if (existingPayment.status !== 'approved') {
      throw new Error('El pago debe estar aprobado antes de liberar fondos');
    }

    // Update payment status to released
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: 'released',
        escrow_released_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId)
      .is('escrow_released_at', null);

    if (paymentError) {
      console.error('Error releasing escrow:', paymentError);
      throw paymentError;
    }

    // Update commission status
    const { data: payment } = await supabaseClient
      .from('payments')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (payment) {
      await supabaseClient
        .from('commissions')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('payment_id', payment.id);
    }

    console.log('Escrow released successfully for booking:', bookingId);

    return new Response(
      JSON.stringify({ success: true, message: 'Fondos liberados exitosamente' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in release-escrow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
