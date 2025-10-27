-- Crear perfil de business y suscripción premium para elpibito@gmail.com
WITH user_info AS (
  SELECT id, email FROM auth.users WHERE email = 'elpibito@gmail.com'
)
-- Crear perfil de business si no existe
INSERT INTO business_profiles (
  id,
  company_name,
  company_type,
  billing_email
)
SELECT 
  ui.id,
  'Empresa Demo' as company_name,
  'company' as company_type,
  ui.email as billing_email
FROM user_info ui
WHERE NOT EXISTS (
  SELECT 1 FROM business_profiles WHERE id = ui.id
);

-- Crear suscripción premium con acceso completo
INSERT INTO business_subscriptions (
  business_id,
  plan_type,
  price,
  status,
  monthly_contacts_limit,
  contacts_used,
  can_post_ads,
  ad_impressions_limit,
  current_period_start,
  current_period_end
)
SELECT 
  id,
  'premium' as plan_type,
  2990 as price,
  'active' as status,
  200 as monthly_contacts_limit,
  0 as contacts_used,
  true as can_post_ads,
  50000 as ad_impressions_limit,
  now() as current_period_start,
  (now() + interval '30 days') as current_period_end
FROM auth.users 
WHERE email = 'elpibito@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM business_subscriptions 
  WHERE business_id = auth.users.id 
  AND status = 'active'
);