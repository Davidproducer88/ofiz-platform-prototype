import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileCheck, Upload, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChat, Message } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateBookingFromChat } from './CreateBookingFromChat';
import { BookingActionsInChat } from './BookingActionsInChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo y tamaño
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Tipo de archivo no válido',
          description: 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP) y videos (MP4, MOV, WEBM)',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: 'Archivo muy grande',
          description: 'El archivo no puede superar los 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string } | null> => {
    if (!profile?.id) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      return { url: publicUrl, type: file.type };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error al subir archivo',
        description: 'No se pudo subir el archivo. Intenta nuevamente.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedFile) || sending || uploading) return;

    setUploading(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;

      // Si hay un archivo, subirlo primero
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        if (uploadResult) {
          attachmentUrl = uploadResult.url;
          attachmentType = uploadResult.type;
        } else {
          setUploading(false);
          return;
        }
      }

      // Enviar mensaje con o sin adjunto
      await sendMessage(messageText.trim() || '📎 Archivo adjunto', attachmentUrl, attachmentType);
      setMessageText('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Detect user role in this conversation
  const isClient = conversationData?.client_id === profile?.id;
  const isMaster = conversationData?.master_id === profile?.id;
  
  // Client can create booking if no booking exists yet
  const canCreateBooking = isClient && conversationData && !conversationData.booking_id;
  
  // Check if there's a pending booking that the master can accept
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  
  useEffect(() => {
    const loadPendingBooking = async () => {
      if (conversationData?.booking_id) {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', conversationData.booking_id)
          .single();
        setPendingBooking(data);
      } else {
        setPendingBooking(null);
      }
    };
    loadPendingBooking();
  }, [conversationData?.booking_id]);

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

  // Note: canCreateBooking is now defined above with proper role check

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
                        {message.censored && (
                          <div className="text-xs mb-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center gap-1">
                            ⚠️ Contenido censurado
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                         {message.attachment_url && (
                          <div className="mt-2">
                            {message.attachment_type?.startsWith('image/') ? (
                              <img 
                                src={message.attachment_url} 
                                alt="Adjunto" 
                                className="rounded max-w-full h-auto max-h-64 object-cover"
                              />
                            ) : message.attachment_type?.startsWith('video/') ? (
                              <video 
                                src={message.attachment_url} 
                                controls 
                                className="rounded max-w-full h-auto max-h-64"
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

      {/* Booking Actions - Show if there's a pending booking */}
      {pendingBooking && (pendingBooking.status === 'pending' || pendingBooking.status === 'confirmed') && (
        <div className="border-t p-3">
          <BookingActionsInChat
            booking={pendingBooking}
            isMaster={isMaster}
            isClient={isClient}
            conversationId={conversationId}
            onUpdate={() => {
              loadConversationData();
              refreshConversations();
            }}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4 text-primary" />
              ) : (
                <Upload className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            title="Adjuntar foto o video"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sending || uploading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={(!messageText.trim() && !selectedFile) || sending || uploading}
            size="icon"
          >
            {uploading ? (
              <Upload className="h-4 w-4 animate-pulse" />
            ) : (
              <Send className="h-4 w-4" />
            )}
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
