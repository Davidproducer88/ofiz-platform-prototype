-- Corregir search_path en las funciones para eliminar advertencias de seguridad

-- 1. Eliminar triggers primero
DROP TRIGGER IF EXISTS update_client_addresses_updated_at ON public.client_addresses;

-- 2. Ahora recrear la función con search_path correcto
CREATE OR REPLACE FUNCTION public.update_client_address_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Recrear el trigger
CREATE TRIGGER update_client_addresses_updated_at
BEFORE UPDATE ON public.client_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_client_address_updated_at();

-- Corregir función update_post_engagement
CREATE OR REPLACE FUNCTION public.update_post_engagement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.feed_posts
  SET engagement_score = (
    views_count * 0.1 + 
    likes_count * 1.0 +
    (SELECT COUNT(*) FROM user_interactions WHERE target_id = NEW.target_id AND interaction_type IN ('share', 'save')) * 2.0
  )
  WHERE id = NEW.target_id AND NEW.target_type = 'post';
  RETURN NEW;
END;
$$;

-- Corregir función update_conversation_last_message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
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