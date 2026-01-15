-- Mark existing users as founders (they are the first users)
-- First, mark existing masters as founders
UPDATE public.profiles
SET 
  is_founder = true,
  founder_registered_at = created_at,
  founder_discount_percentage = 30
WHERE user_type = 'master' 
  AND is_founder IS NOT TRUE;

-- Mark existing clients as founders  
UPDATE public.profiles
SET 
  is_founder = true,
  founder_registered_at = created_at,
  founder_discount_percentage = 30
WHERE user_type = 'client' 
  AND is_founder IS NOT TRUE;

-- Create founder discount codes for existing founders who don't have one
INSERT INTO public.founder_discount_codes (user_id, code, discount_percentage, description, is_active, max_uses, times_used, valid_from)
SELECT 
  p.id,
  CASE 
    WHEN p.user_type = 'master' THEN 'FUNDADOR' || UPPER(SUBSTRING(p.id::text, 1, 6))
    ELSE 'CLIENTE' || UPPER(SUBSTRING(p.id::text, 1, 6))
  END,
  30,
  'Código de descuento fundador - 30% OFF',
  true,
  10,
  0,
  NOW()
FROM public.profiles p
WHERE p.is_founder = true
  AND NOT EXISTS (
    SELECT 1 FROM public.founder_discount_codes fdc WHERE fdc.user_id = p.id
  );