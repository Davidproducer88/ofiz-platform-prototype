-- Solución para Warning 1: Agregar search_path a funciones que lo necesitan
-- Actualizando funciones críticas para incluir SET search_path = public

-- Actualizar search_masters (función de búsqueda)
CREATE OR REPLACE FUNCTION public.search_masters(query text)
 RETURNS TABLE(id uuid, full_name text, avatar_url text, city text, hourly_rate numeric)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  select
    m.id,
    p.full_name,
    p.avatar_url,
    p.city,
    m.hourly_rate
  from masters m
  join profiles p on p.id = m.id
  where
    m.business_name ilike '%' || query || '%'
    or m.description ilike '%' || query || '%'
    or p.full_name ilike '%' || query || '%'
$function$;

-- Actualizar is_admin para incluir search_path explícito
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT public.has_role(COALESCE(user_id, auth.uid()), 'admin')
$function$;

-- Comentario de confirmación
COMMENT ON FUNCTION public.search_masters IS 'Función de búsqueda de maestros con search_path seguro';
COMMENT ON FUNCTION public.is_admin IS 'Verifica rol de admin con search_path seguro';