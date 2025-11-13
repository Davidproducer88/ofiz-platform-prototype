-- Eliminar el trigger problemático que usa pg_net (no disponible)
DROP TRIGGER IF EXISTS send_founder_welcome_email_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.trigger_founder_welcome_email();

-- Crear función más simple que solo crea una notificación al admin
CREATE OR REPLACE FUNCTION public.notify_new_founder()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  total_founders INTEGER;
  remaining_slots INTEGER;
BEGIN
  IF NEW.is_founder = true AND (OLD.is_founder IS NULL OR OLD.is_founder = false) THEN
    -- Contar fundadores
    SELECT COUNT(*) INTO total_founders
    FROM public.profiles
    WHERE is_founder = true;
    
    remaining_slots := 1000 - total_founders;
    
    -- Notificar a admins sobre nuevo fundador
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    SELECT 
      ur.user_id,
      'founder_new',
      '✨ Nuevo Usuario Fundador',
      NEW.full_name || ' se ha unido como fundador. Quedan ' || remaining_slots || ' lugares disponibles.',
      jsonb_build_object(
        'founder_user_id', NEW.id,
        'remaining_slots', remaining_slots,
        'total_founders', total_founders
      )
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar sobre nuevos fundadores
CREATE TRIGGER notify_new_founder_trigger
AFTER INSERT OR UPDATE OF is_founder ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_founder();