-- Seed data: servicios para maestros existentes
INSERT INTO public.services (master_id, title, description, category, price, duration_minutes, status) VALUES
-- David Moreno Rivera - Electricidad
('fcc2e619-f73e-4440-8e43-9f632aa0acbb', 'Instalación Eléctrica Residencial', 'Instalación completa de cableado, tableros y puntos de luz para viviendas.', 'electricity', 2500, 120, 'active'),
('fcc2e619-f73e-4440-8e43-9f632aa0acbb', 'Reparación de Cortocircuitos', 'Diagnóstico y reparación de fallas eléctricas, cortocircuitos y problemas de voltaje.', 'electricity', 1500, 60, 'active'),
('fcc2e619-f73e-4440-8e43-9f632aa0acbb', 'Instalación de Luces LED', 'Instalación de iluminación LED moderna para interiores y exteriores.', 'electricity', 1800, 90, 'active'),
-- Jose Perez - Plomería
('5c3a42f2-6755-4974-bdd5-44e8d509d705', 'Reparación de Cañerías', 'Detección y reparación de pérdidas en cañerías de agua y gas.', 'plumbing', 2000, 90, 'active'),
('5c3a42f2-6755-4974-bdd5-44e8d509d705', 'Instalación Sanitaria Completa', 'Instalación de baños, cocinas y sistemas sanitarios.', 'plumbing', 4500, 240, 'active'),
('5c3a42f2-6755-4974-bdd5-44e8d509d705', 'Destapación de Desagües', 'Servicio de destapación de cañerías y desagües con equipos profesionales.', 'plumbing', 1200, 60, 'active'),
-- edgardovarela2015 - Carpintería
('0948f8f9-c6a1-41b5-9188-26784b7e6422', 'Muebles a Medida', 'Diseño y fabricación de muebles a medida en madera maciza.', 'carpentry', 8000, 480, 'active'),
('0948f8f9-c6a1-41b5-9188-26784b7e6422', 'Reparación de Aberturas', 'Reparación y mantenimiento de puertas, ventanas y marcos de madera.', 'carpentry', 2200, 120, 'active'),
-- pruebamaestro - Pintura
('a09dc367-e7d6-4a60-addc-afe39a7bec24', 'Pintura Interior', 'Pintura de paredes, techos y molduras en interiores. Preparación de superficies incluida.', 'painting', 1800, 180, 'active'),
('a09dc367-e7d6-4a60-addc-afe39a7bec24', 'Pintura Exterior', 'Pintura de fachadas, muros y superficies exteriores resistente a la intemperie.', 'painting', 2500, 240, 'active'),
-- nicorasusupano - Limpieza
('3ee56afa-de9e-4d9d-995f-8251a232f9da', 'Limpieza Profunda Residencial', 'Limpieza completa de hogar incluyendo cocina, baños, pisos y ventanas.', 'cleaning', 3500, 240, 'active'),
('3ee56afa-de9e-4d9d-995f-8251a232f9da', 'Limpieza de Oficinas', 'Servicio de limpieza profesional para oficinas y espacios comerciales.', 'cleaning', 2800, 180, 'active'),
-- Usuario - Construcción
('ccd9500a-e4d7-4650-a1cc-4d8e5021c618', 'Albañilería General', 'Trabajos de albañilería: muros, revoques, pisos, reparaciones generales.', 'construction', 3000, 300, 'active'),
('ccd9500a-e4d7-4650-a1cc-4d8e5021c618', 'Remodelación de Baño', 'Remodelación completa de baños: cerámica, sanitarios, grifería.', 'construction', 12000, 960, 'active');
