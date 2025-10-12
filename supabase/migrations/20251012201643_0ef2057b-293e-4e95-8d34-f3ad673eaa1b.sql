-- Fix the handle_user_role_assignment function to properly cast user_type to app_role
-- The issue is that PostgreSQL cannot directly cast between custom enum types
-- We need to cast to text first, then to app_role

CREATE OR REPLACE FUNCTION public.handle_user_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign role based on user_type
  -- Cast to text first, then to app_role to avoid enum cast errors
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    NEW.user_type::text::app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;