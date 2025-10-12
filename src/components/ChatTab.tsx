import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConversationsList } from '@/components/ConversationsList';
import { ChatWindow } from '@/components/ChatWindow';
import { Conversation } from '@/hooks/useChat';

export const ChatTab = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <Card className="shadow-card h-[calc(100vh-300px)]">
      <CardContent className="p-0 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Lista de conversaciones */}
          <div className="border-r">
            <ConversationsList
              onConversationSelect={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Ventana de chat */}
          <div className="col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                otherUserName={selectedConversation.other_user_name || 'Usuario'}
                bookingTitle={selectedConversation.booking_title}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecciona una conversación para comenzar a chatear
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};