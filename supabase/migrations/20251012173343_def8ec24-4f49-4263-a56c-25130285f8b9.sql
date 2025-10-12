-- ============================================
-- FASE 1: Sistema de Notificaciones, Chat y Bookings Mejorados
-- ============================================

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking_new', 'booking_accepted', 'booking_updated', 'booking_completed', 'booking_cancelled', 'message_new', 'review_new', 'application_new', 'application_accepted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  conversation_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Habilitar RLS en notificaciones
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificaciones
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- 2. Crear tabla de conversaciones
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Índices para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_master_id ON public.conversations(master_id);

-- Habilitar RLS en conversaciones
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversaciones
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = master_id OR is_admin());

CREATE POLICY "Participants can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = master_id);

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = master_id);

-- 3. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Habilitar RLS en mensajes
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mensajes
CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.master_id = auth.uid())
    ) OR is_admin()
  );

CREATE POLICY "Conversation participants can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_id = auth.uid() OR conversations.master_id = auth.uid())
    ) AND sender_id = auth.uid()
  );

CREATE POLICY "Senders can update own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

-- 4. Trigger para actualizar last_message_at en conversaciones
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- 5. Función para crear notificación automática al crear mensaje
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Determinar el destinatario (el que NO es el remitente)
  SELECT 
    CASE 
      WHEN conversations.client_id = NEW.sender_id THEN conversations.master_id
      ELSE conversations.client_id
    END INTO recipient_id
  FROM public.conversations
  WHERE conversations.id = NEW.conversation_id;
  
  -- Obtener nombre del remitente
  SELECT full_name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  -- Crear notificación
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    conversation_id,
    metadata
  ) VALUES (
    recipient_id,
    'message_new',
    'Nuevo mensaje',
    sender_name || ' te ha enviado un mensaje',
    NEW.conversation_id,
    jsonb_build_object('message_preview', LEFT(NEW.content, 100))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_create_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- 6. Función para crear notificación al cambiar estado de booking
CREATE OR REPLACE FUNCTION create_booking_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
  recipient_id UUID;
BEGIN
  -- Solo crear notificación si el estado cambió
  IF OLD.status IS NULL OR NEW.status != OLD.status THEN
    -- Determinar tipo de notificación basado en el nuevo estado
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_type := 'booking_accepted';
        notification_title := 'Reserva confirmada';
        notification_message := 'Tu reserva ha sido confirmada por el profesional';
        recipient_id := NEW.client_id;
      WHEN 'in_progress' THEN
        notification_type := 'booking_updated';
        notification_title := 'Servicio en progreso';
        notification_message := 'El profesional ha comenzado el servicio';
        recipient_id := NEW.client_id;
      WHEN 'completed' THEN
        notification_type := 'booking_completed';
        notification_title := 'Servicio completado';
        notification_message := 'El servicio ha sido completado. ¡Deja una reseña!';
        recipient_id := NEW.client_id;
      WHEN 'cancelled' THEN
        notification_type := 'booking_cancelled';
        notification_title := 'Reserva cancelada';
        notification_message := 'La reserva ha sido cancelada';
        recipient_id := NEW.client_id;
      WHEN 'pending' THEN
        -- Nueva reserva pendiente, notificar al master
        IF OLD.status IS NULL THEN
          notification_type := 'booking_new';
          notification_title := 'Nueva reserva';
          notification_message := 'Tienes una nueva solicitud de reserva';
          recipient_id := NEW.master_id;
        END IF;
      ELSE
        RETURN NEW;
    END CASE;
    
    -- Crear la notificación
    IF notification_type IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        booking_id,
        metadata
      ) VALUES (
        recipient_id,
        notification_type,
        notification_title,
        notification_message,
        NEW.id,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_status_notification();

-- 7. Habilitar Realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Configurar replica identity para realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;