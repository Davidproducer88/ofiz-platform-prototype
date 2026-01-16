-- ===========================================
-- FIX 1: Referral Codes - Restringir acceso público
-- ===========================================

-- Eliminar la política que permite a cualquiera ver códigos activos
DROP POLICY IF EXISTS "Anyone can view active codes for validation" ON public.referral_codes;

-- Crear función para validar códigos de referido (server-side)
CREATE OR REPLACE FUNCTION public.validate_referral_code(code_to_validate TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS is_valid,
    rc.discount_percentage
  FROM public.referral_codes rc
  WHERE rc.code = code_to_validate
    AND rc.is_active = true
    AND (rc.valid_until IS NULL OR rc.valid_until > now())
  LIMIT 1;
  
  -- Si no encontró resultado, devolver false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false AS is_valid, 0::NUMERIC AS discount_percentage;
  END IF;
END;
$$;

-- ===========================================
-- FIX 2: Masters - Crear vista pública sin datos sensibles
-- ===========================================

-- Crear vista pública que excluye coordenadas exactas
CREATE OR REPLACE VIEW public.masters_public
WITH (security_invoker = false) AS
SELECT 
  m.id,
  m.business_name,
  m.description,
  m.experience_years,
  m.hourly_rate,
  m.rating,
  m.total_reviews,
  m.is_verified,
  m.availability_schedule,
  m.created_at,
  -- Excluimos latitude y longitude exactos por privacidad
  -- Solo incluimos datos públicos necesarios para el marketplace
  p.full_name,
  p.avatar_url,
  p.city
FROM public.masters m
LEFT JOIN public.profiles p ON m.id = p.id;

-- Permitir SELECT en la vista pública
GRANT SELECT ON public.masters_public TO anon, authenticated;

-- Comentario: La tabla masters necesita ser pública para el marketplace,
-- pero las coordenadas exactas (latitude/longitude) ya no se exponen directamente.
-- Los usuarios autenticados que necesiten coordenadas deben usar la tabla original
-- a través de políticas más restrictivas.