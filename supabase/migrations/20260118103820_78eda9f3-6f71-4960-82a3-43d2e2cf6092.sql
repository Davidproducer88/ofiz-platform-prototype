-- Agregar columna para propinas en payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS tip_amount numeric DEFAULT 0;

-- Agregar columna para indicar si ya se mostró el prompt de valoración
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS quick_rating_shown boolean DEFAULT false;

-- Comentarios descriptivos
COMMENT ON COLUMN public.payments.tip_amount IS 'Monto de propina opcional del cliente al maestro';
COMMENT ON COLUMN public.bookings.quick_rating_shown IS 'Indica si ya se mostró el widget de valoración rápida';