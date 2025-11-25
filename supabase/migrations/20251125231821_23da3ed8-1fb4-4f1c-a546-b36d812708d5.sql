-- Agregar columnas necesarias a la tabla bookings para el nuevo sistema de pagos

-- Agregar columnas si no existen
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS price_base NUMERIC,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS mp_fee_estimated NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method_selected TEXT,
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('total', 'partial')),
ADD COLUMN IF NOT EXISTS upfront_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS neto_profesional NUMERIC DEFAULT 0;

-- Comentarios para documentación
COMMENT ON COLUMN public.bookings.price_base IS 'Precio base del trabajo antes de comisiones';
COMMENT ON COLUMN public.bookings.platform_fee IS 'Comisión de Ofiz (5%)';
COMMENT ON COLUMN public.bookings.mp_fee_estimated IS 'Comisión estimada de Mercado Pago';
COMMENT ON COLUMN public.bookings.payment_method_selected IS 'Método de pago elegido: mp_cuenta_debito_prepaga_redes | mp_credito_1_cuota | mp_credito_en_cuotas';
COMMENT ON COLUMN public.bookings.payment_type IS 'Tipo de pago: total (100%) o partial (50/50)';
COMMENT ON COLUMN public.bookings.upfront_amount IS 'Monto pagado por adelantado';
COMMENT ON COLUMN public.bookings.pending_amount IS 'Monto pendiente de pago (solo para payment_type=partial)';
COMMENT ON COLUMN public.bookings.neto_profesional IS 'Monto neto que recibirá el profesional después de comisiones';

-- Migrar datos existentes: usar total_price como price_base si está vacío
UPDATE public.bookings 
SET price_base = total_price 
WHERE price_base IS NULL AND total_price IS NOT NULL;

-- Calcular platform_fee para registros existentes (5%)
UPDATE public.bookings 
SET platform_fee = ROUND(COALESCE(price_base, total_price) * 0.05, 2)
WHERE platform_fee = 0 OR platform_fee IS NULL;

-- Establecer mp_fee_estimated por defecto (2.5% - el más bajo)
UPDATE public.bookings 
SET mp_fee_estimated = ROUND(COALESCE(price_base, total_price) * 0.025, 2)
WHERE mp_fee_estimated = 0 OR mp_fee_estimated IS NULL;

-- Calcular neto_profesional para registros existentes
UPDATE public.bookings 
SET neto_profesional = COALESCE(price_base, total_price) - COALESCE(platform_fee, 0) - COALESCE(mp_fee_estimated, 0)
WHERE neto_profesional = 0 OR neto_profesional IS NULL;