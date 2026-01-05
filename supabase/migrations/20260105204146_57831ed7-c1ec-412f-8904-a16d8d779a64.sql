-- Fix security definer view warning by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.masters_with_profile_and_services;

CREATE VIEW public.masters_with_profile_and_services 
WITH (security_invoker = true)
AS
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