-- Hacer booking_id nullable en conversations
ALTER TABLE conversations 
ALTER COLUMN booking_id DROP NOT NULL;

-- Agregar índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(client_id, master_id);

-- Actualizar constraint de notifications para incluir tipos de aplicaciones
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_request',
  'booking_confirmed',
  'booking_accepted', 
  'booking_cancelled',
  'booking_completed',
  'booking_updated',
  'booking_new',
  'new_review',
  'new_message',
  'message_new',
  'payment_received',
  'subscription_expiring',
  'subscription_renewed',
  'marketplace_order_confirmed',
  'marketplace_new_sale',
  'marketplace_order_shipped',
  'marketplace_order_delivered',
  'application_new',
  'application_accepted',
  'application_rejected'
));

-- Recrear el trigger de creación de conversación al aceptar
CREATE OR REPLACE FUNCTION public.create_conversation_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_data RECORD;
  conv_id UUID;
BEGIN
  -- Solo proceder si el estado cambió a 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Obtener datos de la solicitud
    SELECT sr.client_id, sr.title 
    INTO request_data
    FROM public.service_requests sr
    WHERE sr.id = NEW.request_id;
    
    -- Crear conversación si no existe una entre este cliente y maestro
    INSERT INTO public.conversations (
      client_id,
      master_id,
      booking_id
    )
    SELECT 
      request_data.client_id,
      NEW.master_id,
      NULL -- Sin booking inicialmente
    WHERE NOT EXISTS (
      SELECT 1 FROM public.conversations
      WHERE client_id = request_data.client_id
      AND master_id = NEW.master_id
      AND booking_id IS NULL
    )
    RETURNING id INTO conv_id;
    
    -- Si ya existía una conversación, obtener su ID
    IF conv_id IS NULL THEN
      SELECT id INTO conv_id
      FROM public.conversations
      WHERE client_id = request_data.client_id
      AND master_id = NEW.master_id
      AND booking_id IS NULL
      LIMIT 1;
    END IF;
    
    -- Notificar al maestro
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata
    ) VALUES (
      NEW.master_id,
      'application_accepted',
      'Presupuesto aceptado',
      'Tu presupuesto para "' || request_data.title || '" ha sido aceptado. Ahora puedes chatear con el cliente.',
      jsonb_build_object(
        'application_id', NEW.id,
        'request_id', NEW.request_id,
        'conversation_id', conv_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recrear triggers
DROP TRIGGER IF EXISTS on_application_accepted ON service_applications;
CREATE TRIGGER on_application_accepted
  AFTER UPDATE ON service_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_on_accept();

DROP TRIGGER IF EXISTS on_application_created ON service_applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON service_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_received();