import { MessageSquare, Star, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { useChat } from '@/hooks/useChat';
import { toast } from '@/hooks/use-toast';
import { PaymentButton } from '@/components/PaymentButton';

interface BookingActionsProps {
  booking: {
    id: string;
    status: string;
    client_id: string;
    master_id: string;
    service_id: string;
    total_price: number;
    scheduled_date: string;
    services?: {
      title: string;
    };
  };
  userType: 'client' | 'master';
  otherUserName?: string;
  onReview?: () => void;
  onReschedule?: () => void;
  onUpdate?: () => void;
}

export const BookingActions = ({ 
  booking, 
  userType, 
  otherUserName,
  onReview,
  onReschedule,
  onUpdate
}: BookingActionsProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { getOrCreateConversation } = useChat();

  const handleOpenChat = async () => {
    const convId = await getOrCreateConversation(
      booking.id,
      booking.client_id,
      booking.master_id
    );

    if (convId) {
      setConversationId(convId);
      setChatOpen(true);
    }
  };

  const showChat = booking.status !== 'cancelled';
  const showReview = booking.status === 'completed' && userType === 'client';
  const showReschedule = ['pending', 'confirmed'].includes(booking.status);
  const showPayment = booking.status === 'pending' && userType === 'client';

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {showPayment && (
          <PaymentButton
            bookingId={booking.id}
            amount={booking.total_price}
            title={`Pago - ${booking.services?.title || 'Servicio'}`}
            description={`Reserva para ${new Date(booking.scheduled_date).toLocaleDateString('es-AR')}`}
            onSuccess={onUpdate}
          />
        )}
        
        {showChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenChat}
            className="flex-1 sm:flex-none"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        )}
        
        {showReview && onReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReview}
            className="flex-1 sm:flex-none"
          >
            <Star className="h-4 w-4 mr-2" />
            Dejar reseña
          </Button>
        )}

        {showReschedule && onReschedule && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReschedule}
            className="flex-1 sm:flex-none"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reprogramar
          </Button>
        )}
      </div>

      {conversationId && (
        <ChatWindow
          conversationId={conversationId}
          otherUserName={otherUserName || 'Usuario'}
          bookingTitle={booking.services?.title}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
};