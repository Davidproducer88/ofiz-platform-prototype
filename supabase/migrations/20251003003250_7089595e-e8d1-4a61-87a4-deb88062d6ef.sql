-- Fix the handle_oauth_user trigger to use correct metadata field
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
DROP FUNCTION IF EXISTS public.handle_oauth_user();

CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- For OAuth users and email verification, mark as verified and set provider
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    UPDATE public.profiles 
    SET 
      email_verified = true,
      login_provider = CASE 
        WHEN NEW.raw_app_metadata->>'provider' = 'google' THEN 'google'
        WHEN NEW.raw_app_metadata->>'provider' = 'facebook' THEN 'facebook'
        ELSE COALESCE(login_provider, 'email')
      END
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_verified
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_oauth_user();