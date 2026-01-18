import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuickRatingWidget } from './QuickRatingWidget';
import { TipDialog } from './TipDialog';

interface Booking {
  id: string;
  status: string;
  quick_rating_shown?: boolean;
  master_id: string;
  services?: {
    title: string;
  };
  masters?: {
    id: string;
    business_name?: string;
    profiles?: {
      full_name: string;
    };
  };
}

interface PostServiceFeedbackProps {
  clientId: string;
}

export const PostServiceFeedback = ({ clientId }: PostServiceFeedbackProps) => {
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    checkForCompletedBookings();
  }, [clientId]);

  const checkForCompletedBookings = async () => {
    try {
      // Buscar bookings completados que no han mostrado el rating
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          quick_rating_shown,
          master_id,
          services (title),
          masters:master_id (
            id,
            business_name
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .or('quick_rating_shown.is.null,quick_rating_shown.eq.false')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Obtener el nombre del maestro
        const { data: masterProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.master_id)
          .single();

        const bookingWithProfile = {
          ...data,
          masters: {
            ...data.masters,
            profiles: masterProfile
          }
        } as Booking;

        setPendingBooking(bookingWithProfile);
        // Pequeño delay para que no sea intrusivo
        setTimeout(() => setShowRating(true), 2000);
      }
    } catch (error) {
      console.error('Error checking completed bookings:', error);
    }
  };

  const getMasterName = () => {
    if (!pendingBooking) return 'el profesional';
    return pendingBooking.masters?.profiles?.full_name 
      || pendingBooking.masters?.business_name 
      || 'el profesional';
  };

  const handleRatingSuccess = () => {
    setShowRating(false);
  };

  const handleShowTip = () => {
    setShowTip(true);
  };

  const handleTipSuccess = () => {
    setShowTip(false);
    setPendingBooking(null);
  };

  if (!pendingBooking) return null;

  return (
    <>
      <QuickRatingWidget
        open={showRating}
        onOpenChange={setShowRating}
        bookingId={pendingBooking.id}
        masterId={pendingBooking.master_id}
        clientId={clientId}
        masterName={getMasterName()}
        serviceName={pendingBooking.services?.title || 'el servicio'}
        onSuccess={handleRatingSuccess}
        onShowTip={handleShowTip}
      />

      <TipDialog
        open={showTip}
        onOpenChange={setShowTip}
        bookingId={pendingBooking.id}
        masterName={getMasterName()}
        onSuccess={handleTipSuccess}
      />
    </>
  );
};
