-- First drop the view that depends on services.category
DROP VIEW IF EXISTS public.masters_with_profile_and_services;

-- Drop the old enum type created in failed attempt
DROP TYPE IF EXISTS public.service_category_v2;

-- Create the new expanded enum type
CREATE TYPE public.service_category_v2 AS ENUM (
  'plumbing',
  'electricity',
  'carpentry',
  'painting',
  'cleaning',
  'gardening',
  'appliance_repair',
  'computer_repair',
  'construction',
  'hvac',
  'metalwork',
  'automotive',
  'industrial',
  'appliances',
  'computer',
  'textiles',
  'glass',
  'moving',
  'crafts',
  'security',
  'renewable',
  'marine',
  'emerging'
);

-- Update all columns that use the enum
ALTER TABLE public.advertisements
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.business_contracts
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.feed_posts
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.master_portfolio
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.service_requests
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.services
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.sponsored_content
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

ALTER TABLE public.user_interactions
  ALTER COLUMN category TYPE public.service_category_v2
  USING category::text::public.service_category_v2;

-- Swap enum types
ALTER TYPE public.service_category RENAME TO service_category_old;
ALTER TYPE public.service_category_v2 RENAME TO service_category;
DROP TYPE public.service_category_old;

-- Recreate the view with the new enum type
CREATE VIEW public.masters_with_profile_and_services AS
SELECT m.id,
    m.business_name,
    m.description,
    m.hourly_rate,
    m.experience_years,
    m.rating,
    m.total_reviews,
    m.is_verified,
    m.latitude,
    m.longitude,
    jsonb_build_object('full_name', p.full_name, 'avatar_url', p.avatar_url, 'city', p.city) AS profiles,
    COALESCE(jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'category', s.category)) FILTER (WHERE s.id IS NOT NULL), '[]'::jsonb) AS services
   FROM masters m
     JOIN profiles p ON p.id = m.id
     LEFT JOIN services s ON s.master_id = m.id
  GROUP BY m.id, p.full_name, p.avatar_url, p.city;