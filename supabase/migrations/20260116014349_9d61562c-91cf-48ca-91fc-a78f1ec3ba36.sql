-- Corregir la vista para usar security_invoker en lugar de security_definer
DROP VIEW IF EXISTS public.masters_public;

CREATE VIEW public.masters_public
WITH (security_invoker = true) AS
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
  p.full_name,
  p.avatar_url,
  p.city
FROM public.masters m
LEFT JOIN public.profiles p ON m.id = p.id;

-- Permitir SELECT en la vista pública
GRANT SELECT ON public.masters_public TO anon, authenticated;