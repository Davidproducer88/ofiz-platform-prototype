import { MessageSquare, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, Conversation } from '@/hooks/useChat';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationsListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export const ConversationsList = ({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationsListProps) => {
  const { conversations, loading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.booking_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Búsqueda */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Las conversaciones aparecerán aquí cuando reserves un servicio
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConversationId === conversation.id
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => onConversationSelect(conversation)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(conversation.other_user_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {conversation.other_user_name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.booking_title}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.last_message_at)}
                          </span>
                          {conversation.unread_count! > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};