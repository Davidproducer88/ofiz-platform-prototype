import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { BookingConfirmationEmail } from './_templates/booking-confirmation.tsx';
import { BookingReminderEmail } from './_templates/booking-reminder.tsx';
import { WorkCompletedEmail } from './_templates/work-completed.tsx';
import { PaymentReceiptEmail } from './_templates/payment-receipt.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailType = 'booking_confirmation' | 'booking_reminder' | 'work_completed' | 'payment_receipt';

interface EmailRequest {
  type: EmailType;
  bookingId: string;
  recipientRole?: 'client' | 'master' | 'both';
  paymentId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, bookingId, recipientRole = 'both', paymentId }: EmailRequest = await req.json();

    console.log(`Processing ${type} email for booking ${bookingId}`);

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        services(title, category),
        client:profiles!bookings_client_id_fkey(id, full_name, email:id),
        master:masters!bookings_master_id_fkey(
          id,
          profiles!masters_id_fkey(id, full_name, email:id)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      throw new Error('Booking not found');
    }

    // Get client and master emails from auth
    const { data: clientAuth } = await supabaseClient.auth.admin.getUserById(booking.client_id);
    const { data: masterAuth } = await supabaseClient.auth.admin.getUserById(booking.master_id);

    const clientEmail = clientAuth?.user?.email;
    const masterEmail = masterAuth?.user?.email;
    const clientName = booking.client?.full_name || 'Cliente';
    const masterName = booking.master?.profiles?.full_name || 'Profesional';
    const serviceName = booking.services?.title || 'Servicio';

    // Format date and time
    const scheduledDate = new Date(booking.scheduled_date);
    const formattedDate = scheduledDate.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailsSent: string[] = [];

    // Generate and send emails based on type
    switch (type) {
      case 'booking_confirmation': {
        // Send to client
        if ((recipientRole === 'client' || recipientRole === 'both') && clientEmail) {
          const clientHtml = await renderAsync(
            React.createElement(BookingConfirmationEmail, {
              recipientName: clientName,
              recipientRole: 'client',
              serviceName,
              scheduledDate: formattedDate,
              scheduledTime: formattedTime,
              address: booking.client_address,
              totalPrice: booking.total_price,
              otherPartyName: masterName,
              bookingId,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [clientEmail],
            subject: `✅ Reserva confirmada: ${serviceName}`,
            html: clientHtml,
          });
          emailsSent.push(`client:${clientEmail}`);
        }

        // Send to master
        if ((recipientRole === 'master' || recipientRole === 'both') && masterEmail) {
          const masterHtml = await renderAsync(
            React.createElement(BookingConfirmationEmail, {
              recipientName: masterName,
              recipientRole: 'master',
              serviceName,
              scheduledDate: formattedDate,
              scheduledTime: formattedTime,
              address: booking.client_address,
              totalPrice: booking.total_price,
              otherPartyName: clientName,
              bookingId,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [masterEmail],
            subject: `📥 Nueva reserva: ${serviceName}`,
            html: masterHtml,
          });
          emailsSent.push(`master:${masterEmail}`);
        }
        break;
      }

      case 'booking_reminder': {
        const hoursUntil = Math.round((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60));

        // Send to client
        if ((recipientRole === 'client' || recipientRole === 'both') && clientEmail) {
          const clientHtml = await renderAsync(
            React.createElement(BookingReminderEmail, {
              recipientName: clientName,
              recipientRole: 'client',
              serviceName,
              scheduledDate: formattedDate,
              scheduledTime: formattedTime,
              address: booking.client_address,
              otherPartyName: masterName,
              hoursUntil,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [clientEmail],
            subject: `⏰ Recordatorio: ${serviceName} mañana`,
            html: clientHtml,
          });
          emailsSent.push(`client:${clientEmail}`);
        }

        // Send to master
        if ((recipientRole === 'master' || recipientRole === 'both') && masterEmail) {
          const masterHtml = await renderAsync(
            React.createElement(BookingReminderEmail, {
              recipientName: masterName,
              recipientRole: 'master',
              serviceName,
              scheduledDate: formattedDate,
              scheduledTime: formattedTime,
              address: booking.client_address,
              otherPartyName: clientName,
              hoursUntil,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [masterEmail],
            subject: `⏰ Recordatorio: ${serviceName} mañana`,
            html: masterHtml,
          });
          emailsSent.push(`master:${masterEmail}`);
        }
        break;
      }

      case 'work_completed': {
        // Only send to client
        if (clientEmail) {
          const completedDate = new Date().toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const html = await renderAsync(
            React.createElement(WorkCompletedEmail, {
              clientName,
              masterName,
              serviceName,
              completedDate,
              totalPrice: booking.total_price,
              bookingId,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [clientEmail],
            subject: `✅ Trabajo completado: ${serviceName}`,
            html,
          });
          emailsSent.push(`client:${clientEmail}`);
        }
        break;
      }

      case 'payment_receipt': {
        if (!paymentId) throw new Error('Payment ID required for receipt');

        // Fetch payment details
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();

        if (paymentError || !payment) {
          throw new Error('Payment not found');
        }

        if (clientEmail) {
          const paymentDate = new Date(payment.created_at).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const html = await renderAsync(
            React.createElement(PaymentReceiptEmail, {
              clientName,
              masterName,
              serviceName,
              paymentDate,
              subtotal: payment.master_amount,
              platformFee: payment.commission_amount,
              totalPaid: payment.amount,
              paymentMethod: payment.payment_method || 'MercadoPago',
              transactionId: payment.mercadopago_payment_id || payment.id,
              bookingId,
            })
          );

          await resend.emails.send({
            from: 'Ofiz <notificaciones@resend.dev>',
            to: [clientEmail],
            subject: `💳 Recibo de pago: ${serviceName}`,
            html,
          });
          emailsSent.push(`client:${clientEmail}`);
        }
        break;
      }

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log(`Emails sent successfully:`, emailsSent);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        emailsSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-booking-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
