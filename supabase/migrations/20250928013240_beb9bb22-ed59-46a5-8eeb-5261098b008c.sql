-- Add email verification and login type tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS login_provider text DEFAULT 'email',
ADD COLUMN IF NOT EXISTS verification_sent_at timestamp with time zone DEFAULT NULL;

-- Create function to handle OAuth users
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- For OAuth users, mark as verified and set provider
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles 
    SET 
      email_verified = true,
      login_provider = CASE 
        WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
        WHEN NEW.app_metadata->>'provider' = 'facebook' THEN 'facebook'
        ELSE login_provider
      END
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for OAuth user handling
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_oauth_user();