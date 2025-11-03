-- Asignar rol admin al usuario matiasalderete10@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Obtener el ID del usuario con el email especificado
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'matiasalderete10@gmail.com';
  
  -- Verificar que el usuario existe
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email matiasalderete10@gmail.com no encontrado';
  END IF;
  
  -- Asignar rol admin usando la función existente
  PERFORM assign_admin_role(target_user_id);
  
  RAISE NOTICE 'Rol admin asignado exitosamente al usuario %', target_user_id;
END $$;