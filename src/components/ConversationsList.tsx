import { MessageSquare, Search, Clock, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat, Conversation } from '@/hooks/useChat';
import { useState, useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
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

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv =>
      conv.other_user_name?.toLowerCase().includes(term) ||
      conv.booking_title?.toLowerCase().includes(term)
    );
  }, [conversations, searchTerm]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: es });
      }
      
      if (isYesterday(date)) {
        return 'Ayer';
      }
      
      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: es
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Búsqueda */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mb-4 p-3 bg-muted rounded-full inline-block">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">
              {searchTerm ? 'Sin resultados' : 'Sin conversaciones'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? 'No se encontraron conversaciones con ese término' 
                : 'Las conversaciones aparecerán aquí cuando reserves un servicio'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedConversationId === conversation.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : ''
                }`}
                onClick={() => onConversationSelect(conversation)}
              >
                <div className="flex gap-3">
                  <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {getInitials(conversation.other_user_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        {conversation.other_user_name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {conversation.booking_title}
                      </p>
                      {conversation.unread_count! > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-xs font-bold animate-pulse"
                        >
                          {conversation.unread_count! > 99 ? '99+' : conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};