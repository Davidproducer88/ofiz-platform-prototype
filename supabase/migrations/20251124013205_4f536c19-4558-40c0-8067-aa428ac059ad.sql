-- Permitir que service_id sea nullable en bookings
-- Esto es necesario para bookings creados desde el chat que no tienen un servicio específico
ALTER TABLE public.bookings 
ALTER COLUMN service_id DROP NOT NULL;