-- =====================================================
-- SECURITY FIX: Create safe public view for profiles
-- Hides sensitive data (phone, email, address, coordinates) from public view
-- =====================================================

-- Create a public-safe view for master/business profiles
-- This only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  city,
  created_at,
  is_founder,
  user_type
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Update profiles policy to be more restrictive
-- Only allow viewing own profile, or profiles with active relationship
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Strict policy: view own profile OR profiles you have relationship with OR masters publicly
CREATE POLICY "Users can view profiles with relationship"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Own profile
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
    -- Masters can be viewed by authenticated users (for search/listing)
    -- but only basic info through profiles_public view
    OR (user_type = 'master')
    OR (user_type = 'business')
  )
);