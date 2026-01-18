import { supabase } from '@/integrations/supabase/client';

export type EmailType = 'booking_confirmation' | 'booking_reminder' | 'work_completed' | 'payment_receipt';

interface SendEmailParams {
  type: EmailType;
  bookingId: string;
  recipientRole?: 'client' | 'master' | 'both';
  paymentId?: string;
}

interface SendEmailResult {
  success: boolean;
  message?: string;
  emailsSent?: string[];
  error?: string;
}

/**
 * Send transactional emails for booking events
 */
export const sendBookingEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: params,
    });

    if (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: data?.message,
      emailsSent: data?.emailsSent,
    };
  } catch (err: any) {
    console.error('Failed to send email:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Send booking confirmation emails to both client and master
 */
export const sendBookingConfirmation = async (bookingId: string): Promise<SendEmailResult> => {
  return sendBookingEmail({
    type: 'booking_confirmation',
    bookingId,
    recipientRole: 'both',
  });
};

/**
 * Send work completed email to client
 */
export const sendWorkCompletedEmail = async (bookingId: string): Promise<SendEmailResult> => {
  return sendBookingEmail({
    type: 'work_completed',
    bookingId,
  });
};

/**
 * Send payment receipt to client
 */
export const sendPaymentReceipt = async (
  bookingId: string,
  paymentId: string
): Promise<SendEmailResult> => {
  return sendBookingEmail({
    type: 'payment_receipt',
    bookingId,
    paymentId,
  });
};

/**
 * Send reminder email (typically called by cron job)
 */
export const sendBookingReminder = async (
  bookingId: string,
  recipientRole: 'client' | 'master' | 'both' = 'both'
): Promise<SendEmailResult> => {
  return sendBookingEmail({
    type: 'booking_reminder',
    bookingId,
    recipientRole,
  });
};
