import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  sender_name?: string;
  blocked?: boolean;
  censored?: boolean;
  block_reason?: string;
}

export interface Conversation {
  id: string;
  booking_id: string | null;
  client_id: string;
  master_id: string;
  last_message_at: string;
  created_at: string;
  other_user_name?: string;
  other_user_id?: string;
  booking_title?: string;
  unread_count?: number;
}

// Cache para nombres de usuario para evitar llamadas duplicadas
const userNameCache = new Map<string, string>();

export const useChat = (conversationId?: string) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Obtener nombre de usuario con cache
  const getUserName = useCallback(async (userId: string): Promise<string> => {
    if (userNameCache.has(userId)) {
      return userNameCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user name:', error);
        return 'Usuario';
      }

      const name = data?.full_name || 'Usuario';
      userNameCache.set(userId, name);
      return name;
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Usuario';
    }
  }, []);

  // Cargar conversaciones del usuario
  const loadConversations = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          bookings!conversations_booking_id_fkey (
            notes,
            services (title)
          )
        `)
        .or(`client_id.eq.${profile.id},master_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Enriquecer con información del otro usuario
      const enrichedPromises = data.map(async (conv) => {
        const otherUserId = conv.client_id === profile.id ? conv.master_id : conv.client_id;
        
        // Obtener nombre del otro usuario con cache
        const otherUserName = await getUserName(otherUserId);

        // Contar mensajes no leídos
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', profile.id);

        // Obtener título del encargo si existe
        let bookingTitle = 'Conversación';
        if (conv.booking_id && conv.bookings) {
          const booking = conv.bookings as any;
          if (booking.services?.title) {
            bookingTitle = booking.services.title;
          } else if (booking.notes) {
            const firstLine = booking.notes.split('\n')[0];
            bookingTitle = firstLine.substring(0, 50) || 'Encargo';
          }
        }

        return {
          ...conv,
          other_user_name: otherUserName,
          other_user_id: otherUserId,
          booking_title: bookingTitle,
          unread_count: count || 0
        };
      });

      const enriched = await Promise.all(enrichedPromises);
      setConversations(enriched);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.id, getUserName]);

  // Cargar mensajes de una conversación
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enriquecer con nombres de usuarios
      const enrichedPromises = (data || []).map(async (msg) => {
        const senderName = await getUserName(msg.sender_id);
        return {
          ...msg,
          sender_name: senderName
        };
      });

      const enriched = await Promise.all(enrichedPromises);
      setMessages(enriched);

      // Marcar mensajes como leídos
      if (profile?.id) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', convId)
          .neq('sender_id', profile.id)
          .eq('read', false);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [profile?.id, getUserName]);

  // Enviar mensaje con filtrado de seguridad
  const sendMessage = useCallback(async (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!conversationId || !profile?.id || (!content.trim() && !attachmentUrl)) return;

    setSending(true);
    try {
      // Filtrar mensaje antes de enviarlo
      let filterResult = null;
      try {
        const { data, error } = await supabase.functions.invoke('filter-chat-message', {
          body: {
            content: content.trim(),
            conversationId,
            senderId: profile.id
          }
        });
        
        if (!error) {
          filterResult = data;
        }
      } catch (filterError) {
        console.error('Filter error:', filterError);
        // Continuar sin filtro si falla
      }

      // Si el mensaje fue bloqueado
      if (filterResult && !filterResult.allowed) {
        toast({
          title: '⛔ Mensaje Bloqueado',
          description: filterResult.block_reason || 'Este mensaje contiene información no permitida',
          variant: 'destructive'
        });
        setSending(false);
        return;
      }

      // Usar contenido censurado si fue modificado
      const finalContent = filterResult?.censored ? filterResult.content : content.trim();
      const isCensored = filterResult?.censored || false;
      const isBlocked = filterResult?.blocked || false;

      // Insertar mensaje en la base de datos
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: finalContent || '📎 Archivo adjunto',
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          blocked: isBlocked,
          censored: isCensored,
          block_reason: filterResult?.block_reason
        });

      if (error) throw error;

      // Actualizar last_message_at de la conversación
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (isCensored) {
        toast({
          title: '⚠️ Mensaje Modificado',
          description: 'Parte de tu mensaje fue censurada por contener información no permitida',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  }, [conversationId, profile?.id]);

  // Crear o obtener conversación existente para un booking
  const getOrCreateConversation = useCallback(async (bookingId: string, clientId: string, masterId: string) => {
    try {
      // Verificar si ya existe
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing.id;
      }

      // Crear nueva conversación
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          booking_id: bookingId,
          client_id: clientId,
          master_id: masterId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      // Refrescar conversaciones
      await loadConversations();

      return newConv.id;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la conversación',
        variant: 'destructive'
      });
      return null;
    }
  }, [loadConversations]);

  // Crear conversación sin booking (directa)
  const createDirectConversation = useCallback(async (masterId: string) => {
    if (!profile?.id) return null;

    try {
      // Verificar si ya existe una conversación directa
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', profile.id)
        .eq('master_id', masterId)
        .is('booking_id', null)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing.id;
      }

      // Crear nueva conversación
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          client_id: profile.id,
          master_id: masterId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      await loadConversations();

      return newConv.id;
    } catch (error) {
      console.error('Error creating direct conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la conversación',
        variant: 'destructive'
      });
      return null;
    }
  }, [profile?.id, loadConversations]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!conversationId || !profile?.id) return;

    loadMessages(conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Obtener nombre del remitente
          const senderName = await getUserName(newMessage.sender_id);

          setMessages(prev => {
            // Evitar duplicados
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, {
              ...newMessage,
              sender_name: senderName
            }];
          });

          // Si no es mensaje propio, marcarlo como leído
          if (newMessage.sender_id !== profile.id) {
            setTimeout(async () => {
              await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMessage.id);

              setMessages(prev =>
                prev.map(m => m.id === newMessage.id ? { ...m, read: true } : m)
              );
            }, 500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, profile?.id, loadMessages, getUserName]);

  // Suscribirse a nuevas conversaciones
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadConversations]);

  // Cargar conversaciones al inicio
  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id, loadConversations]);

  return {
    conversations,
    messages,
    loading,
    sending,
    sendMessage,
    getOrCreateConversation,
    createDirectConversation,
    refreshConversations: loadConversations,
    refreshMessages: conversationId ? () => loadMessages(conversationId) : undefined
  };
};