import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface ContractPaymentRequest {
  applicationId: string;
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

    const { applicationId, paymentMethodId, token, issuerId, installments, payer }: ContractPaymentRequest = await req.json();
    
    console.log('Contract payment request received:', { 
      applicationId, 
      paymentMethodId, 
      hasToken: !!token,
      userId: user.id 
    });

    if (!applicationId) {
      throw new Error('applicationId es requerido');
    }

    // Get application details
    const { data: application, error: appError } = await supabaseClient
      .from('business_contract_applications')
      .select(`
        *,
        contract:business_contracts(
          *,
          business_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Application fetch error:', appError);
      throw new Error('Aplicación no encontrada');
    }

    // Verify business owner
    if (application.contract.business_id !== user.id) {
      console.error('Unauthorized access attempt:', { applicationId, userId: user.id, businessId: application.contract.business_id });
      throw new Error('No autorizado para esta operación');
    }

    const finalAmount = application.proposed_price;

    if (!finalAmount || finalAmount <= 0) {
      console.error('Invalid application amount:', { applicationId, proposedPrice: application.proposed_price });
      throw new Error('El monto es inválido');
    }

    // Calculate commission (5%)
    const commissionAmount = Math.round(finalAmount * 0.05 * 100) / 100;
    const masterAmount = finalAmount - commissionAmount;

    console.log('Contract payment details:', {
      applicationId: application.id,
      business: application.contract.business_id,
      master: application.master_id,
      totalAmount: finalAmount,
      commissionAmount,
      masterAmount
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
      description: `Contrato: ${application.contract.title}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payer?.email || user.email,
        identification: payer?.identification,
      },
      external_reference: applicationId,
      statement_descriptor: 'OFIZ CONTRATO',
      notification_url: `https://dexrrbbpeidcxoynkyrt.supabase.co/functions/v1/mercadopago-webhook`,
      metadata: {
        application_id: applicationId,
        contract_id: application.contract_id,
        business_id: application.contract.business_id,
        master_id: application.master_id,
        type: 'contract'
      }
    };

    console.log('Creating payment with Bricks API');

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': applicationId,
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

    // Use admin client for system operations
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
          user_id: application.contract.business_id,
          type: 'payment_rejected',
          title: '❌ Pago rechazado',
          message: getPaymentErrorMessage(paymentResult.status_detail),
          metadata: {
            application_id: applicationId,
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

    // Payment approved - create payment record
    console.log('Payment approved - processing post-payment updates...');

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        client_id: application.contract.business_id,
        master_id: application.master_id,
        booking_id: null,
        amount: finalAmount,
        commission_amount: commissionAmount,
        master_amount: masterAmount,
        status: 'approved',
        payment_method: paymentResult.payment_method_id,
        mercadopago_payment_id: paymentResult.id.toString(),
        mercadopago_preference_id: null,
        metadata: {
          type: 'contract',
          application_id: applicationId,
          contract_id: application.contract_id,
          contract_title: application.contract.title
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw paymentError;
    }

    console.log('Payment record created:', payment.id);

    // Update application status to 'accepted'
    const { error: updateAppError } = await supabaseAdmin
      .from('business_contract_applications')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateAppError) {
      console.error('Error updating application:', updateAppError);
    }

    // Update contract status
    const { error: updateContractError } = await supabaseAdmin
      .from('business_contracts')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', application.contract_id);

    if (updateContractError) {
      console.error('Error updating contract:', updateContractError);
    }

    // Create commission record
    const { error: commissionError } = await supabaseAdmin
      .from('commissions')
      .insert({
        payment_id: payment.id,
        master_id: application.master_id,
        amount: commissionAmount,
        percentage: 5.00,
        status: 'pending'
      });

    if (commissionError) {
      console.error('Error creating commission:', commissionError);
    }

    // Notify business
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: application.contract.business_id,
        type: 'contract_payment_confirmed',
        title: '✅ Pago confirmado',
        message: `Tu pago de $${finalAmount.toLocaleString()} ha sido aprobado. El proyecto está en progreso.`,
        metadata: {
          application_id: applicationId,
          contract_id: application.contract_id,
          payment_id: paymentResult.id.toString(),
          amount: finalAmount
        }
      });

    // Notify master
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: application.master_id,
        type: 'contract_awarded',
        title: '🎉 Contrato asignado',
        message: `Te han seleccionado para "${application.contract.title}". Recibirás $${masterAmount.toLocaleString()} al completar.`,
        metadata: {
          application_id: applicationId,
          contract_id: application.contract_id,
          payment_id: paymentResult.id.toString(),
          amount: masterAmount
        }
      });

    console.log('All post-payment updates completed');

    return new Response(
      JSON.stringify({ 
        paymentId: paymentResult.id,
        status: paymentResult.status,
        statusDetail: paymentResult.status_detail,
        applicationId: application.id,
        paymentRecordId: payment.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-contract-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error desconocido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
