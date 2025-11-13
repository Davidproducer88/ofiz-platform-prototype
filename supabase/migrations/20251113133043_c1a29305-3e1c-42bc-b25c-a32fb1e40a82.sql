-- Función para enviar email de bienvenida a fundadores automáticamente
CREATE OR REPLACE FUNCTION public.trigger_founder_welcome_email()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_email TEXT;
  discount_code TEXT;
BEGIN
  -- Solo procesar si el usuario se acaba de convertir en fundador
  IF NEW.is_founder = true AND (OLD.is_founder IS NULL OR OLD.is_founder = false) THEN
    
    -- Obtener email del usuario
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.id;
    
    -- Obtener el código de descuento recién creado
    SELECT code INTO discount_code
    FROM public.founder_discount_codes
    WHERE user_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Solo enviar si tenemos email y código
    IF user_email IS NOT NULL AND discount_code IS NOT NULL THEN
      -- Llamar a edge function para enviar email de bienvenida
      -- Nota: Esto usa pg_net extension para hacer HTTP requests desde postgres
      PERFORM
        net.http_post(
          url := current_setting('app.supabase_url') || '/functions/v1/send-founder-welcome-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
          ),
          body := jsonb_build_object(
            'userId', NEW.id,
            'userName', NEW.full_name,
            'userEmail', user_email,
            'discountCode', discount_code,
            'discountPercentage', COALESCE(NEW.founder_discount_percentage, 10)
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para enviar email automáticamente
DROP TRIGGER IF EXISTS send_founder_welcome_email_trigger ON public.profiles;
CREATE TRIGGER send_founder_welcome_email_trigger
AFTER INSERT OR UPDATE OF is_founder ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_founder_welcome_email();