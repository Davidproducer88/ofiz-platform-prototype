import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useChat, Message } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateBookingFromChat } from './CreateBookingFromChat';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  bookingTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatWindow = ({ 
  conversationId, 
  otherUserName, 
  bookingTitle,
  isOpen,
  onClose 
}: ChatWindowProps) => {
  const { profile } = useAuth();
  const { messages, sending, sendMessage, refreshConversations } = useChat(conversationId);
  const [messageText, setMessageText] = useState('');
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    loadConversationData();
  }, [conversationId]);

  const loadConversationData = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();
    
    setConversationData(data);
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    await sendMessage(messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return '';
    }
  };

  const canCreateBooking = conversationData && !conversationData.booking_id;

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{otherUserName}</h3>
            {bookingTitle && (
              <p className="text-sm text-muted-foreground">{bookingTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canCreateBooking && (
              <Button
                size="sm"
                onClick={() => setShowCreateBooking(true)}
                className="gap-2"
              >
                <FileCheck className="h-4 w-4" />
                Crear Encargo
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay mensajes aún</p>
              <p className="text-sm mt-2">Envía el primer mensaje para comenzar la conversación</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === profile?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                        {(message.sender_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Card
                        className={`p-3 ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.attachment_url && (
                          <div className="mt-2">
                            {message.attachment_type?.startsWith('image/') ? (
                              <img 
                                src={message.attachment_url} 
                                alt="Adjunto" 
                                className="rounded max-w-full h-auto"
                              />
                            ) : (
                              <a 
                                href={message.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs underline flex items-center gap-1"
                              >
                                <Paperclip className="h-3 w-3" />
                                Ver archivo adjunto
                              </a>
                            )}
                          </div>
                        )}
                      </Card>
                      <div className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>
                        {formatTime(message.created_at)}
                        {isOwn && message.read && (
                          <span className="ml-1">· Leído</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled
            title="Adjuntar archivo (próximamente)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Si se proporciona isOpen y onClose, renderizar como Dialog
  if (isOpen !== undefined && onClose) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl h-[600px] p-0">
            {content}
          </DialogContent>
        </Dialog>
        {conversationData && (
          <CreateBookingFromChat
            open={showCreateBooking}
            onOpenChange={setShowCreateBooking}
            conversationId={conversationId}
            masterId={conversationData.master_id}
            clientId={conversationData.client_id}
            onSuccess={() => {
              refreshConversations();
              loadConversationData();
            }}
          />
        )}
      </>
    );
  }

  // De lo contrario, renderizar directamente
  return (
    <>
      <div className="h-full">{content}</div>
      {conversationData && (
        <CreateBookingFromChat
          open={showCreateBooking}
          onOpenChange={setShowCreateBooking}
          conversationId={conversationId}
          masterId={conversationData.master_id}
          clientId={conversationData.client_id}
          onSuccess={() => {
            refreshConversations();
            loadConversationData();
          }}
        />
      )}
    </>
  );
};
