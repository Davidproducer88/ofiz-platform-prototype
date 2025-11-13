-- Agregar campos para early adopters y beneficios
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS founder_registered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS free_trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS founder_discount_percentage NUMERIC DEFAULT 0;

-- Agregar campo para beneficios en subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS has_founder_discount BOOLEAN DEFAULT FALSE;

-- Agregar campo para business_subscriptions
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS has_founder_discount BOOLEAN DEFAULT FALSE;

-- Comentarios para documentación
COMMENT ON COLUMN profiles.is_founder IS 'Usuario fundador (primeros 1000 o beta period)';
COMMENT ON COLUMN profiles.founder_registered_at IS 'Fecha de registro como fundador';
COMMENT ON COLUMN profiles.free_trial_ends_at IS 'Fecha fin del trial gratuito';
COMMENT ON COLUMN profiles.founder_discount_percentage IS 'Porcentaje de descuento lifetime para fundadores';