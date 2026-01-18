import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting booking reminders check...');

    // Get bookings scheduled for the next 24-26 hours that haven't been reminded yet
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('id, scheduled_date, status')
      .gte('scheduled_date', in24Hours.toISOString())
      .lte('scheduled_date', in26Hours.toISOString())
      .in('status', ['confirmed', 'pending'])
      .is('review_requested_at', null); // Use this field to track if reminder was sent

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} bookings to remind`);

    const emailFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    let sentCount = 0;
    const errors: string[] = [];

    for (const booking of bookings || []) {
      try {
        // Send reminder email
        const response = await fetch(emailFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            type: 'booking_reminder',
            bookingId: booking.id,
            recipientRole: 'both',
          }),
        });

        if (response.ok) {
          // Mark reminder as sent using review_requested_at (repurposing field)
          // In production, you'd want a dedicated reminder_sent_at field
          await supabaseClient
            .from('bookings')
            .update({ review_requested_at: now.toISOString() })
            .eq('id', booking.id);

          sentCount++;
          console.log(`Reminder sent for booking ${booking.id}`);
        } else {
          const errorData = await response.text();
          errors.push(`Booking ${booking.id}: ${errorData}`);
        }
      } catch (error: any) {
        errors.push(`Booking ${booking.id}: ${error.message}`);
      }
    }

    console.log(`Reminders complete: ${sentCount} sent, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${bookings?.length || 0} bookings`,
        sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-booking-reminders:', error);
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
