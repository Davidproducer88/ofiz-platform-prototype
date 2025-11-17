-- Assign 'client' role to matiasalderete10@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'matiasalderete10@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'client'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;