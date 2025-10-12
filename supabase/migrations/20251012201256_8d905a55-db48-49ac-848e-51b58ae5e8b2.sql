-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('client', 'master', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);

-- Fix the handle_oauth_user trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if email was just confirmed and raw_app_meta_data exists
  IF NEW.email_confirmed_at IS NOT NULL 
     AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL)
     AND NEW.raw_app_meta_data IS NOT NULL THEN
    
    UPDATE public.profiles 
    SET 
      email_verified = true,
      login_provider = CASE 
        WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        WHEN NEW.raw_app_meta_data->>'provider' = 'facebook' THEN 'facebook'
        ELSE COALESCE(login_provider, 'email')
      END
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign role when profile is created
CREATE OR REPLACE FUNCTION public.handle_user_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign role based on user_type
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    NEW.user_type::app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger on profiles table to assign role
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role_assignment();

-- Also handle updates to user_type
CREATE TRIGGER on_profile_updated_assign_role
  AFTER UPDATE OF user_type ON public.profiles
  FOR EACH ROW
  WHEN (OLD.user_type IS DISTINCT FROM NEW.user_type)
  EXECUTE FUNCTION public.handle_user_role_assignment();

-- Update is_admin function to use new roles table
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(COALESCE(user_id, auth.uid()), 'admin')
$$;