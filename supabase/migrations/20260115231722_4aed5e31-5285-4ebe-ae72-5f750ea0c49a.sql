-- Actualizar porcentaje de descuento de fundadores de 30% a 20%

-- Actualizar profiles
UPDATE public.profiles
SET founder_discount_percentage = 20
WHERE is_founder = true AND founder_discount_percentage = 30;

-- Actualizar códigos de descuento
UPDATE public.founder_discount_codes
SET 
  discount_percentage = 20,
  description = REPLACE(description, '30%', '20%')
WHERE discount_percentage = 30;