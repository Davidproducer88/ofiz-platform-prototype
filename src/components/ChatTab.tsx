import { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConversationsList } from '@/components/ConversationsList';
import { ChatWindow } from '@/components/ChatWindow';
import { Conversation, useChat } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/use-mobile';

export const ChatTab = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations, loading, refreshConversations, refreshMessages } = useChat(selectedConversation?.id);
  const isMobile = useIsMobile();
  const [refreshing, setRefreshing] = useState(false);

  // Calcular total de mensajes no leídos
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConversations();
    if (selectedConversation && refreshMessages) {
      await refreshMessages();
    }
    setTimeout(() => setRefreshing(false), 500);
  };
  
  // Cuando se selecciona una conversación, actualizar contador de no leídos
  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Refrescar para actualizar contadores después de marcar como leídos
    setTimeout(() => refreshConversations(), 1000);
  };

  // En mobile, si hay conversación seleccionada, mostrar solo el chat
  if (isMobile && selectedConversation) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedConversation(null)}
          >
            ← Volver
          </Button>
          <span className="font-medium truncate">{selectedConversation.other_user_name}</span>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden">
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUserName={selectedConversation.other_user_name || 'Usuario'}
            bookingTitle={selectedConversation.booking_title}
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Mensajes
                {totalUnread > 0 && (
                  <Badge variant="destructive" className="h-6 px-2">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {conversations.length} {conversations.length === 1 ? 'conversación' : 'conversaciones'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 h-[calc(100vh-350px)] min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Lista de conversaciones */}
          <div className="border-r bg-muted/20">
            <ConversationsList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
              conversations={conversations}
              loading={loading}
            />
          </div>

          {/* Ventana de chat */}
          <div className="col-span-2 hidden md:block">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                otherUserName={selectedConversation.other_user_name || 'Usuario'}
                bookingTitle={selectedConversation.booking_title}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                <div className="text-center max-w-md p-8">
                  <div className="mb-6 p-4 bg-primary/10 rounded-full inline-block">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {conversations.length === 0 
                      ? 'No tienes conversaciones' 
                      : 'Selecciona una conversación'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {conversations.length === 0 
                      ? 'Cuando reserves un servicio o recibas un presupuesto, podrás chatear con los profesionales aquí.'
                      : 'Haz clic en una conversación de la lista para ver los mensajes y responder.'
                    }
                  </p>
                  {conversations.length === 0 && (
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="text-xs">1</Badge>
                        <span>Busca un servicio o profesional</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="text-xs">2</Badge>
                        <span>Realiza una reserva o solicitud</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="text-xs">3</Badge>
                        <span>¡Comienza a chatear!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Lista de conversaciones ocupa todo el espacio */}
          {isMobile && !selectedConversation && (
            <div className="col-span-full md:hidden">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="mb-4 p-4 bg-primary/10 rounded-full">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Sin conversaciones</h3>
                  <p className="text-sm text-muted-foreground">
                    Las conversaciones aparecerán cuando reserves un servicio
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};