-- Eliminar la política insegura que permite inserciones anónimas de perfiles de maestros
-- Esta política permite que cualquiera sin autenticación cree perfiles de maestros,
-- lo cual expone datos personales sensibles

DROP POLICY IF EXISTS "Save anonimous" ON public.profiles;

-- Ahora solo las políticas autenticadas permanecen:
-- 1. Users can insert own profile (requiere auth.uid() = id)
-- 2. Authenticated users can view own profile, admins can view all
-- 3. Users can update own profile
-- Esto garantiza que solo usuarios autenticados puedan crear sus propios perfiles