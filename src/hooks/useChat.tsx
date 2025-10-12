import { useState, useEffect } from 'react';
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
}

export interface Conversation {
  id: string;
  booking_id: string;
  client_id: string;
  master_id: string;
  last_message_at: string;
  created_at: string;
  other_user_name?: string;
  other_user_id?: string;
  booking_title?: string;
  unread_count?: number;
}

export const useChat = (conversationId?: string) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Cargar conversaciones del usuario
  const loadConversations = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          bookings!conversations_booking_id_fkey (
            services (title)
          )
        `)
        .or(`client_id.eq.${profile.id},master_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del otro usuario
      const enriched = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.client_id === profile.id ? conv.master_id : conv.client_id;
          
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherUserId)
            .single();

          // Contar mensajes no leídos
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', profile.id);

          return {
            ...conv,
            other_user_name: userData?.full_name || 'Usuario',
            other_user_id: otherUserId,
            booking_title: (conv.bookings as any)?.services?.title || 'Servicio',
            unread_count: count || 0
          };
        })
      );

      setConversations(enriched);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes de una conversación
  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enriquecer con nombres de usuarios
      const enriched = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', msg.sender_id)
            .single();

          return {
            ...msg,
            sender_name: userData?.full_name || 'Usuario'
          };
        })
      );

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
  };

  // Enviar mensaje
  const sendMessage = async (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!conversationId || !profile?.id || !content.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: content.trim(),
          attachment_url: attachmentUrl,
          attachment_type: attachmentType
        });

      if (error) throw error;
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
  };

  // Crear o obtener conversación existente para un booking
  const getOrCreateConversation = async (bookingId: string, clientId: string, masterId: string) => {
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
  };

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
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMessage,
            sender_name: userData?.full_name || 'Usuario'
          }]);

          // Si no es mensaje propio, marcarlo como leído
          if (newMessage.sender_id !== profile.id) {
            setTimeout(() => {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMessage.id)
                .then(() => {
                  setMessages(prev =>
                    prev.map(m => m.id === newMessage.id ? { ...m, read: true } : m)
                  );
                });
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, profile?.id]);

  // Cargar conversaciones al inicio
  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id]);

  return {
    conversations,
    messages,
    loading,
    sending,
    sendMessage,
    getOrCreateConversation,
    refreshConversations: loadConversations,
    refreshMessages: conversationId ? () => loadMessages(conversationId) : undefined
  };
};