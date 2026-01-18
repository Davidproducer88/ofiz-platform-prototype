import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileCheck, Upload, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat, Message } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CreateBookingFromChat } from './CreateBookingFromChat';
import { BookingActionsInChat } from './BookingActionsInChat';
import { TypingIndicator } from './chat/TypingIndicator';
import { QuickMessages } from './chat/QuickMessages';
import { QuotationDialog } from './chat/QuotationDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';

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
  const { typingUsers, startTyping, stopTyping, isAnyoneTyping } = useTypingIndicator(conversationId);
  const [messageText, setMessageText] = useState('');
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadConversationData = useCallback(async () => {
    setLoadingConversation(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      
      if (error) throw error;
      setConversationData(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoadingConversation(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversationData();
  }, [loadConversationData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Tipo de archivo no válido',
          description: 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP) y videos (MP4, MOV, WEBM)',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
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

  // Roles en la conversación
  const isClient = conversationData?.client_id === profile?.id;
  const isMaster = conversationData?.master_id === profile?.id;
  const canCreateBooking = isClient && conversationData && !conversationData.booking_id;
  
  // Booking pendiente
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  
  useEffect(() => {
    const loadPendingBooking = async () => {
      if (conversationData?.booking_id) {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', conversationData.booking_id)
          .maybeSingle();
        setPendingBooking(data);
      } else {
        setPendingBooking(null);
      }
    };
    loadPendingBooking();
  }, [conversationData?.booking_id]);

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: es });
      }
      if (isYesterday(date)) {
        return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
      }
      return format(date, "d MMM HH:mm", { locale: es });
    } catch {
      return '';
    }
  };

  const getDateSeparator = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) return 'Hoy';
      if (isYesterday(date)) return 'Ayer';
      return format(date, "EEEE, d 'de' MMMM", { locale: es });
    } catch {
      return '';
    }
  };

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((groups, message, index) => {
    const messageDate = new Date(message.created_at);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !prevMessage || !isSameDay(messageDate, new Date(prevMessage.created_at));
    
    if (showDateSeparator) {
      groups.push({ type: 'date', value: getDateSeparator(message.created_at), key: `date-${message.id}` });
    }
    groups.push({ type: 'message', value: message, key: message.id });
    return groups;
  }, [] as Array<{ type: 'date' | 'message'; value: any; key: string }>);

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {otherUserName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{otherUserName}</h3>
              {bookingTitle && (
                <p className="text-sm text-muted-foreground truncate">{bookingTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canCreateBooking && (
              <Button
                size="sm"
                onClick={() => setShowCreateBooking(true)}
                className="gap-2"
              >
                <FileCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Crear Encargo</span>
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
          {loadingConversation ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex gap-2 max-w-[80%]">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 w-48 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 p-4 bg-muted/50 rounded-full inline-block">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">Inicia la conversación</h4>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Envía el primer mensaje para comenzar a chatear con {otherUserName}
              </p>
            </div>
          ) : (
            groupedMessages.map((item) => {
              if (item.type === 'date') {
                return (
                  <div key={item.key} className="flex justify-center my-4">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {item.value}
                    </Badge>
                  </div>
                );
              }

              const message = item.value as Message;
              const isOwn = message.sender_id === profile?.id;
              
              return (
                <div
                  key={item.key}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                        {(message.sender_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <Card
                        className={`p-3 shadow-sm ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-muted rounded-bl-sm'
                        }`}
                      >
                        {message.censored && (
                          <div className="text-xs mb-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Contenido moderado
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
                                className="rounded max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(message.attachment_url, '_blank')}
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
                                className="text-xs underline flex items-center gap-1 hover:opacity-80"
                              >
                                <Paperclip className="h-3 w-3" />
                                Ver archivo adjunto
                              </a>
                            )}
                          </div>
                        )}
                      </Card>
                      <div className={`text-xs text-muted-foreground flex items-center gap-1 ${isOwn ? 'justify-end' : ''}`}>
                        <span>{formatMessageTime(message.created_at)}</span>
                        {isOwn && message.read && (
                          <span className="text-primary">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isAnyoneTyping && typingUsers.length > 0 && (
              <TypingIndicator userName={typingUsers[0]?.name} />
            )}
          </AnimatePresence>
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Booking Actions */}
      {pendingBooking && ['pending', 'confirmed', 'in_progress', 'pending_review'].includes(pendingBooking.status) && (
        <div className="border-t p-3 bg-muted/30">
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
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="h-5 w-5 text-primary" />
              ) : (
                <Upload className="h-5 w-5 text-primary" />
              )}
              <div className="min-w-0">
                <span className="text-sm font-medium truncate block">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
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
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Quick Messages */}
          <QuickMessages 
            userType={isMaster ? 'master' : 'client'} 
            onSelect={(msg) => setMessageText(msg)} 
          />
          
          {/* Quotation Button - Only for Master */}
          {isMaster && conversationData && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQuotation(true)}
              title="Enviar cotización"
              className="shrink-0"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          
          <Input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              startTyping();
            }}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder="Escribe un mensaje..."
            disabled={sending || uploading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={(!messageText.trim() && !selectedFile) || sending || uploading}
            size="icon"
            className="shrink-0"
          >
            {uploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar como Dialog si es necesario
  if (isOpen !== undefined && onClose) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl h-[600px] p-0">
            {content}
          </DialogContent>
        </Dialog>
        {conversationData && (
          <>
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
            <QuotationDialog
              open={showQuotation}
              onOpenChange={setShowQuotation}
              conversationId={conversationId}
              masterId={conversationData.master_id}
              clientId={conversationData.client_id}
              bookingId={conversationData.booking_id}
              onSuccess={() => {
                refreshConversations();
              }}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <div className="h-full">{content}</div>
      {conversationData && (
        <>
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
          <QuotationDialog
            open={showQuotation}
            onOpenChange={setShowQuotation}
            conversationId={conversationId}
            masterId={conversationData.master_id}
            clientId={conversationData.client_id}
            bookingId={conversationData.booking_id}
            onSuccess={() => {
              refreshConversations();
            }}
          />
        </>
      )}
    </>
  );
};