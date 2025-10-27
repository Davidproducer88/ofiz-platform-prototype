-- Trigger para notificar al cliente cuando recibe un presupuesto
CREATE OR REPLACE FUNCTION public.notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  client_id_var UUID;
  master_name TEXT;
  request_title TEXT;
BEGIN
  -- Obtener client_id y título de la solicitud
  SELECT sr.client_id, sr.title INTO client_id_var, request_title
  FROM public.service_requests sr
  WHERE sr.id = NEW.request_id;
  
  -- Obtener nombre del maestro
  SELECT p.full_name INTO master_name
  FROM public.profiles p
  WHERE p.id = NEW.master_id;
  
  -- Crear notificación
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    client_id_var,
    'application_new',
    'Nuevo presupuesto recibido',
    master_name || ' ha enviado un presupuesto para "' || request_title || '"',
    jsonb_build_object(
      'application_id', NEW.id,
      'request_id', NEW.request_id,
      'master_id', NEW.master_id,
      'proposed_price', NEW.proposed_price
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger
DROP TRIGGER IF EXISTS on_application_created ON public.service_applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.service_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_received();

-- Función para crear conversación cuando se acepta un presupuesto
CREATE OR REPLACE FUNCTION public.create_conversation_on_accept()
RETURNS TRIGGER AS $$
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
    
    -- Crear conversación si no existe
    INSERT INTO public.conversations (
      client_id,
      master_id,
      booking_id
    )
    SELECT 
      request_data.client_id,
      NEW.master_id,
      gen_random_uuid() -- Temporal, se actualizará cuando se cree el booking
    WHERE NOT EXISTS (
      SELECT 1 FROM public.conversations
      WHERE client_id = request_data.client_id
      AND master_id = NEW.master_id
      AND booking_id IS NULL
    )
    RETURNING id INTO conv_id;
    
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
      'Tu presupuesto para "' || request_data.title || '" ha sido aceptado',
      jsonb_build_object(
        'application_id', NEW.id,
        'request_id', NEW.request_id,
        'conversation_id', conv_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger
DROP TRIGGER IF EXISTS on_application_accepted ON public.service_applications;
CREATE TRIGGER on_application_accepted
  AFTER UPDATE ON public.service_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_on_accept();