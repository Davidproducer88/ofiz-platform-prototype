-- Agregar campo para confirmación del cliente
ALTER TABLE public.bookings
ADD COLUMN client_confirmed_at timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.bookings.client_confirmed_at IS 'Timestamp cuando el cliente confirma que el trabajo fue completado satisfactoriamente';