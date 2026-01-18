-- Update user "Ofiz" from client to business
UPDATE profiles 
SET user_type = 'business', updated_at = now() 
WHERE id = '24af1bf3-1f14-4156-a2cd-447982fdb3ae';

-- Create business_profiles entry if it doesn't exist
INSERT INTO business_profiles (id, company_name, company_type, created_at, updated_at)
VALUES (
  '24af1bf3-1f14-4156-a2cd-447982fdb3ae',
  'Ofiz',
  'empresa',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;