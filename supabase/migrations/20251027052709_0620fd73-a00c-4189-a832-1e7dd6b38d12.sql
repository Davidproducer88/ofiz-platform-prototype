-- Arreglar search_path para las funciones modificadas
CREATE OR REPLACE FUNCTION public.create_conversation_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

CREATE OR REPLACE FUNCTION public.notify_application_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;