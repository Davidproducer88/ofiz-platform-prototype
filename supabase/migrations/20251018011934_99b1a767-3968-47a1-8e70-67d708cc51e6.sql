-- Crear función helper para asignar rol admin (solo ejecutable por admins existentes o via SQL directo)
CREATE OR REPLACE FUNCTION assign_admin_role(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertar el rol admin si no existe
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Comentario: Para asignar rol admin a un usuario, ejecutar en SQL Editor:
-- SELECT assign_admin_role('USER_UUID_AQUI');
-- Reemplazar USER_UUID_AQUI con el ID del usuario (obtenible desde Auth > Users)