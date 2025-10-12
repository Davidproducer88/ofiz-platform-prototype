-- Corregir funciones para agregar search_path y evitar advertencias de seguridad

-- 1. Actualizar función update_conversation_last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- 2. Actualizar función create_message_notification
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Actualizar función create_booking_status_notification
CREATE OR REPLACE FUNCTION create_booking_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;