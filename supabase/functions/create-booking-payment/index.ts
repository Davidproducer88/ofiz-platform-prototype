import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingPaymentRequest {
  bookingId: string;
  paymentMethodId?: string;
  token?: string;
  issuerId?: string;
  installments?: number;
  paymentPercentage?: number;
  incentiveDiscount?: number;
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

    const { bookingId, paymentMethodId, token, issuerId, installments, payer, paymentPercentage = 100, incentiveDiscount = 0 }: BookingPaymentRequest = await req.json();
    
    console.log('Booking payment request received:', { 
      bookingId, 
      paymentMethodId, 
      hasToken: !!token,
      userId: user.id 
    });

    if (!bookingId) {
      throw new Error('bookingId es requerido');
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError);
      throw new Error('Reserva no encontrada');
    }

    // Verify client
    if (booking.client_id !== user.id) {
      console.error('Unauthorized access attempt:', { bookingId, userId: user.id, clientId: booking.client_id });
      throw new Error('No autorizado para esta reserva');
    }

    const finalAmount = booking.total_price;
    
    // Calculate payment based on percentage
    const paymentAmount = paymentPercentage === 50 ? finalAmount * 0.5 : finalAmount;
    const remainingAmount = paymentPercentage === 50 ? finalAmount * 0.5 : 0;

    if (!paymentAmount || paymentAmount <= 0) {
      console.error('Invalid payment amount:', { bookingId, totalPrice: booking.total_price, paymentPercentage });
      throw new Error('El monto del pago es inválido');
    }

    // Calculate commission (5%)
    const commissionAmount = Math.round(paymentAmount * 0.05 * 100) / 100;
    const masterAmount = paymentAmount - commissionAmount;

    console.log('Booking details:', {
      bookingId: booking.id,
      client: booking.client_id,
      master: booking.master_id,
      totalAmount: finalAmount,
      paymentPercentage,
      paymentAmount,
      remainingAmount,
      commissionAmount,
      masterAmount,
      incentiveDiscount
    });

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!mercadoPagoToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('MercadoPago no está configurado');
    }

    // Create payment using Bricks API
    const paymentData = {
      transaction_amount: paymentAmount,
      token: token,
      description: `Pago ${paymentPercentage}% reserva #${booking.id.substring(0, 8)}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payer?.email || user.email,
        identification: payer?.identification,
      },
      external_reference: bookingId,
      statement_descriptor: 'OFIZ SERVICIOS',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        booking_id: bookingId,
        client_id: booking.client_id,
        master_id: booking.master_id,
        type: 'booking',
        payment_percentage: paymentPercentage,
        remaining_amount: remainingAmount,
        incentive_discount: incentiveDiscount
      }
    };

    console.log('Creating payment with Bricks API');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': bookingId,
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

    // Create admin client for system operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create or update payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        client_id: booking.client_id,
        master_id: booking.master_id,
        amount: paymentAmount,
        commission_amount: commissionAmount,
        master_amount: masterAmount,
        status: paymentResult.status === 'approved' ? 'approved' : 'pending',
        payment_method: paymentResult.payment_method_id,
        mercadopago_payment_id: paymentResult.id.toString(),
        payment_percentage: paymentPercentage,
        remaining_amount: remainingAmount,
        installments: installments || 1,
        is_partial_payment: paymentPercentage === 50,
        incentive_discount: incentiveDiscount,
        metadata: {
          mp_status: paymentResult.status,
          mp_status_detail: paymentResult.status_detail,
          payment_percentage: paymentPercentage
        }
      });

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw paymentError;
    }

    console.log('Payment record created');

    // If payment is approved, update booking status
    if (paymentResult.status === 'approved') {
      console.log('Payment approved - updating booking status...');

      const { error: bookingUpdateError } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingUpdateError) {
        console.error('Error updating booking:', bookingUpdateError);
      } else {
        console.log('Booking status updated to confirmed');
      }

      // Create notification for client
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.client_id,
          type: 'payment_confirmed',
          title: '✅ Pago confirmado',
          message: `Tu pago de $${paymentAmount.toLocaleString()} (${paymentPercentage}%) fue aprobado${paymentPercentage === 50 ? '. Pagarás el 50% restante al completar el servicio.' : ''}`,
          metadata: {
            booking_id: bookingId,
            payment_id: paymentResult.id.toString(),
            amount: paymentAmount,
            payment_percentage: paymentPercentage,
            remaining_amount: remainingAmount
          }
        });

      // Create notification for master
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.master_id,
          type: 'booking_confirmed',
          title: '💰 Nueva reserva confirmada',
          message: `Tienes una nueva reserva confirmada por $${masterAmount.toLocaleString()}`,
          metadata: {
            booking_id: bookingId,
            payment_id: paymentResult.id.toString(),
            amount: masterAmount
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
        bookingId: booking.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-booking-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});