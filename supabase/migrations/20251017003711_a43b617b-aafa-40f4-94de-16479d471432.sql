-- Drop existing SELECT policy on profiles table
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;

-- Recreate SELECT policy with explicit authenticated-only access
CREATE POLICY "Authenticated users can view own profile, admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR is_admin());

-- Ensure no public role can access profiles at all
CREATE POLICY "Block all public access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);