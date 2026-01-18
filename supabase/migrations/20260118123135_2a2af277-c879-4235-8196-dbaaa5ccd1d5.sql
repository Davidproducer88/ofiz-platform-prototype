-- =====================================================
-- SECURITY FIX: Restrict profiles and business_profiles access
-- =====================================================

-- 1. FIX profiles: More restrictive policy - only allow viewing full profile
-- when there's an active business relationship, NOT just because they're a master/business
DROP POLICY IF EXISTS "Users can view profiles with relationship" ON public.profiles;

CREATE POLICY "Users can view profiles with active relationship"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Always can see own profile
    id = auth.uid()
    -- Admin can see all
    OR public.has_role(auth.uid(), 'admin')
    -- Has active booking with this user (as client viewing master)
    OR EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.master_id = profiles.id 
      AND b.client_id = auth.uid()
    )
    -- Has active booking with this user (as master viewing client)
    OR EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.client_id = profiles.id 
      AND b.master_id = auth.uid()
    )
    -- Has conversation with this user
    OR EXISTS (
      SELECT 1 FROM conversations c 
      WHERE (c.master_id = profiles.id AND c.client_id = auth.uid())
         OR (c.client_id = profiles.id AND c.master_id = auth.uid())
    )
  )
);

-- 2. Create a SAFE public view for masters - only public info, no PII
DROP VIEW IF EXISTS public.masters_search_view;

CREATE VIEW public.masters_search_view
WITH (security_invoker = on)
AS
SELECT 
  m.id,
  p.full_name,
  p.avatar_url,
  p.city,
  m.business_name,
  m.description,
  m.experience_years,
  m.hourly_rate,
  m.rating,
  m.total_reviews,
  m.is_verified,
  m.latitude,
  m.longitude
  -- Excluded: phone, email, address from profiles
FROM public.masters m
JOIN public.profiles p ON p.id = m.id;

GRANT SELECT ON public.masters_search_view TO anon, authenticated;

-- 3. FIX business_profiles: Create safe public view without sensitive billing info
DROP VIEW IF EXISTS public.business_profiles_public;

CREATE VIEW public.business_profiles_public
WITH (security_invoker = on)
AS
SELECT 
  id,
  company_name,
  company_type,
  company_size,
  industry,
  website,
  created_at
  -- Excluded: tax_id, billing_address, billing_email, billing_phone
FROM public.business_profiles;

GRANT SELECT ON public.business_profiles_public TO anon, authenticated;

-- 4. Ensure business_profiles table is ONLY accessible to owner and admins
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;

CREATE POLICY "Business owners can view own profile only"
ON public.business_profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);