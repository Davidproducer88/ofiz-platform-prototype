-- Agregar rol admin al usuario matiasalderete10@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('2c890a48-896f-4774-af40-43ca387c0f04', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;