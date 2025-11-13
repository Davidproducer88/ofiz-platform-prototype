-- Tabla para trackear alertas de fundadores enviadas
CREATE TABLE IF NOT EXISTS public.founder_alerts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold INTEGER NOT NULL UNIQUE CHECK (threshold IN (100, 50, 25, 10)),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  remaining_slots INTEGER NOT NULL
);

ALTER TABLE public.founder_alerts_sent ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver las alertas
CREATE POLICY "Admins can view founder alerts"
ON public.founder_alerts_sent
FOR SELECT
TO authenticated
USING (is_admin());

-- Función para enviar notificaciones cuando quedan pocos lugares de fundador
CREATE OR REPLACE FUNCTION public.check_founder_slots_and_notify()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  total_founders INTEGER;
  remaining_slots INTEGER;
  threshold_value INTEGER;
  admin_user RECORD;
BEGIN
  -- Solo procesar si is_founder cambió a true
  IF NEW.is_founder = true AND (OLD.is_founder IS NULL OR OLD.is_founder = false) THEN
    -- Contar total de fundadores
    SELECT COUNT(*) INTO total_founders
    FROM public.profiles
    WHERE is_founder = true;
    
    -- Calcular lugares restantes
    remaining_slots := 1000 - total_founders;
    
    -- Verificar si cruzamos algún umbral (100, 50, 25, 10)
    FOR threshold_value IN SELECT unnest(ARRAY[100, 50, 25, 10]) LOOP
      -- Si quedan exactamente o menos lugares que el umbral y no se ha enviado esta alerta
      IF remaining_slots <= threshold_value 
         AND NOT EXISTS (
           SELECT 1 FROM public.founder_alerts_sent 
           WHERE threshold = threshold_value
         ) THEN
        
        -- Registrar que enviamos esta alerta
        INSERT INTO public.founder_alerts_sent (threshold, remaining_slots)
        VALUES (threshold_value, remaining_slots)
        ON CONFLICT (threshold) DO NOTHING;
        
        -- Enviar notificación a todos los administradores
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        SELECT 
          ur.user_id,
          'founder_slots_alert',
          '⚠️ Alerta: Lugares de Fundador',
          CASE 
            WHEN remaining_slots <= 10 THEN '🚨 ¡CRÍTICO! Solo quedan ' || remaining_slots || ' lugares de fundador disponibles'
            WHEN remaining_slots <= 25 THEN '⚠️ ¡URGENTE! Quedan ' || remaining_slots || ' lugares de fundador disponibles'
            WHEN remaining_slots <= 50 THEN '⚠️ Quedan ' || remaining_slots || ' lugares de fundador disponibles'
            ELSE 'ℹ️ Quedan ' || remaining_slots || ' lugares de fundador disponibles'
          END,
          jsonb_build_object(
            'remaining_slots', remaining_slots,
            'threshold', threshold_value,
            'total_founders', total_founders,
            'timestamp', NOW()
          )
        FROM public.user_roles ur
        WHERE ur.role = 'admin';
        
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para ejecutar la función cuando se actualiza profiles
DROP TRIGGER IF EXISTS founder_slots_notification_trigger ON public.profiles;
CREATE TRIGGER founder_slots_notification_trigger
AFTER INSERT OR UPDATE OF is_founder ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_founder_slots_and_notify();