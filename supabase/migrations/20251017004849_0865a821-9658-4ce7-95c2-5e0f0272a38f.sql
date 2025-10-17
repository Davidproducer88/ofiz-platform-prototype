-- Add explicit anonymous blocking policy for business_profiles
CREATE POLICY "Block anonymous access to business profiles"
ON public.business_profiles
FOR ALL
TO anon
USING (false);

-- Add additional security by requiring authenticated role explicitly
DROP POLICY IF EXISTS "Businesses can view own profile" ON public.business_profiles;

CREATE POLICY "Authenticated businesses can view own profile only"
ON public.business_profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = id) OR is_admin());

-- Tighten update policy to require authentication
DROP POLICY IF EXISTS "Businesses can update own profile" ON public.business_profiles;

CREATE POLICY "Authenticated businesses can update own profile only"
ON public.business_profiles
FOR UPDATE
TO authenticated
USING ((auth.uid() = id) OR is_admin());

-- Tighten insert policy
DROP POLICY IF EXISTS "Businesses can insert own profile" ON public.business_profiles;

CREATE POLICY "Authenticated businesses can insert own profile only"
ON public.business_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);