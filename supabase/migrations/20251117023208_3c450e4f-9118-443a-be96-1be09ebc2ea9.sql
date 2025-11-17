-- Reset password for matiasalderete10@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'matiasalderete10@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Update password (hashed with bcrypt)
    UPDATE auth.users
    SET encrypted_password = crypt('isa0303', gen_salt('bf'))
    WHERE id = target_user_id;
  END IF;
END $$;