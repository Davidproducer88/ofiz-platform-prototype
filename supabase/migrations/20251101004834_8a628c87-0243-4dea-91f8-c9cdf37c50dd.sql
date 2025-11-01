-- Asignar rol de administrador al usuario matiasalderete10@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('51cd1f86-c2cd-47aa-935d-0a6f6135d773', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;