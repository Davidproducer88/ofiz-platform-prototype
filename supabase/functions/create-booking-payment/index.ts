import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get user-friendly error messages
function getPaymentErrorMessage(statusDetail: string): string {
  const errorMessages: Record<string, string> = {
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta',
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
    'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
    'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
    'cc_rejected_card_disabled': 'Tarjeta deshabilitada - contacta a tu banco',
    'cc_rejected_max_attempts': 'Límite de intentos alcanzado - intenta más tarde',
    'cc_rejected_duplicated_payment': 'Ya procesaste este pago recientemente',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
    'cc_rejected_high_risk': 'Pago rechazado por seguridad',
    'cc_rejected_blacklist': 'Tarjeta no permitida',
    'cc_rejected_other_reason': 'El pago fue rechazado - intenta con otra tarjeta',
  };
  
  return errorMessages[statusDetail] || 'El pago fue rechazado. Por favor intenta con otra tarjeta.';
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

    const requestBody = await req.json();
    const { 
      bookingId, 
      paymentMethodId, 
      token, 
      issuerId, 
      installments = 1, 
      payer,
      paymentPercentage = 100,
      incentiveDiscount = 0,
      paymentMethod,
      priceBase,
      platformFee,
      mpFee,
      netoProfesional,
      paymentType
    } = requestBody;
    
    console.log('Booking payment request:', { 
      bookingId, 
      paymentMethodId, 
      hasToken: !!token,
      paymentPercentage,
      userId: user.id 
    });

    if (!bookingId) {
      throw new Error('bookingId es requerido');
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, client_id, master_id, total_price, price_base')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError);
      throw new Error('Reserva no encontrada');
    }

    if (booking.client_id !== user.id) {
      throw new Error('No autorizado');
    }

    // Calculate amounts
    const totalAmount = booking.total_price;
    const basePrice = priceBase || booking.price_base || totalAmount;
    const paymentAmount = paymentPercentage === 50 ? totalAmount * 0.5 : totalAmount;
    const remainingAmount = paymentPercentage === 50 ? totalAmount * 0.5 : 0;
    const commissionAmount = platformFee || Math.round(basePrice * 0.05 * 100) / 100;
    const mpFeeAmount = mpFee || Math.round(basePrice * 0.025 * 100) / 100;
    const masterAmount = netoProfesional || (basePrice - commissionAmount - mpFeeAmount);

    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoToken) {
      throw new Error('MercadoPago no configurado');
    }

    // Create payment
    const paymentData = {
      transaction_amount: paymentAmount,
      token,
      description: `Pago ${paymentPercentage}% #${booking.id.substring(0, 8)}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payer?.email || user.email,
        identification: payer?.identification,
      },
      external_reference: bookingId,
      statement_descriptor: 'OFIZ',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        booking_id: bookingId,
        type: 'booking',
        payment_percentage: paymentPercentage,
        remaining_amount: remainingAmount,
        incentive_discount: incentiveDiscount
      }
    };

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
      const errorText = await mpResponse.text();
      console.error('MP error:', errorText);
      throw new Error(`Error de pago: ${mpResponse.status}`);
    }

    const paymentResult = await mpResponse.json();
    console.log('Payment result:', { id: paymentResult.id, status: paymentResult.status, statusDetail: paymentResult.status_detail });

    // Save payment
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // CRITICAL: Only process if payment is approved
    if (paymentResult.status !== 'approved') {
      console.log('Payment NOT approved:', paymentResult.status, paymentResult.status_detail);
      
      // Create notification for rejected payment
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.client_id,
          type: 'payment_rejected',
          title: '❌ Pago rechazado',
          message: getPaymentErrorMessage(paymentResult.status_detail),
          metadata: {
            booking_id: bookingId,
            payment_id: paymentResult.id?.toString(),
            status: paymentResult.status,
            status_detail: paymentResult.status_detail
          }
        });

      // Return error response for rejected payments
      return new Response(
        JSON.stringify({ 
          error: getPaymentErrorMessage(paymentResult.status_detail),
          paymentId: paymentResult.id,
          status: paymentResult.status,
          statusDetail: paymentResult.status_detail,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Payment approved - save payment record
    await supabaseAdmin.from('payments').insert({
      booking_id: bookingId,
      client_id: booking.client_id,
      master_id: booking.master_id,
      amount: paymentAmount,
      commission_amount: commissionAmount,
      master_amount: masterAmount,
      status: 'approved',
      payment_method: paymentResult.payment_method_id,
      mercadopago_payment_id: String(paymentResult.id),
      payment_percentage: paymentPercentage,
      remaining_amount: remainingAmount,
      installments: installments || 1,
      is_partial_payment: paymentPercentage === 50,
      incentive_discount: incentiveDiscount,
      metadata: { mp_status: paymentResult.status }
    });

    // Update booking
    await supabaseAdmin.from('bookings').update({ 
      status: 'confirmed',
      price_base: basePrice,
      platform_fee: commissionAmount,
      mp_fee_estimated: mpFeeAmount,
      payment_method_selected: paymentMethod,
      payment_type: paymentType || (paymentPercentage === 100 ? 'total' : 'partial'),
      upfront_amount: paymentAmount,
      pending_amount: remainingAmount,
      neto_profesional: masterAmount
    }).eq('id', bookingId);
    
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: booking.client_id,
        type: 'payment_confirmed',
        title: '✅ Pago confirmado',
        message: `Pago de $${paymentAmount.toLocaleString()} (${paymentPercentage}%) aprobado`,
        metadata: { booking_id: bookingId, amount: paymentAmount }
      },
      {
        user_id: booking.master_id,
        type: 'booking_confirmed',
        title: '💰 Nueva reserva',
        message: `Reserva confirmada por $${masterAmount.toLocaleString()}`,
        metadata: { booking_id: bookingId, amount: masterAmount }
      }
    ]);

    return new Response(
      JSON.stringify({ 
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
        bookingId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});