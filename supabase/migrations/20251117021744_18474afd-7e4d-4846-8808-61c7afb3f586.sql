-- Asignar rol admin al usuario matiasalderete10@gmail.com
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Obtener el ID del usuario por email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'matiasalderete10@gmail.com';

  -- Verificar que el usuario existe
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email matiasalderete10@gmail.com no encontrado';
  END IF;

  -- Insertar rol admin (si no existe ya)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Confirmar la operación
  RAISE NOTICE 'Rol admin asignado exitosamente al usuario %', target_user_id;
END $$;