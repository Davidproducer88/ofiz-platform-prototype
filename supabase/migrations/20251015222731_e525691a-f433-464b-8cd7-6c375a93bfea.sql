-- Crear función para poblar datos iniciales del feed
CREATE OR REPLACE FUNCTION seed_initial_feed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_ids uuid[];
BEGIN
  -- Obtener IDs de masters existentes
  SELECT ARRAY_AGG(id) INTO master_ids FROM masters LIMIT 5;
  
  IF array_length(master_ids, 1) IS NULL OR array_length(master_ids, 1) = 0 THEN
    RAISE NOTICE 'No masters found';
    RETURN;
  END IF;

  -- Insertar posts solo si no existen
  IF NOT EXISTS (SELECT 1 FROM feed_posts LIMIT 1) THEN
    INSERT INTO feed_posts (master_id, type, title, content, category, media_urls)
    VALUES 
      (master_ids[1], 'tip', '5 Consejos para Mantener tu Hogar Limpio', 
       'Mantener un hogar limpio no tiene que ser complicado. Aquí te comparto mis mejores consejos después de años de experiencia en limpieza profesional...', 
       'cleaning', '{}'),
      (COALESCE(master_ids[2], master_ids[1]), 'showcase', 'Antes y Después: Renovación Completa de Baño', 
       'Este proyecto tomó 3 días pero el resultado valió la pena. Transformamos completamente este baño antiguo en un espacio moderno y funcional.', 
       'plumbing', '{}'),
      (COALESCE(master_ids[3], master_ids[1]), 'update', 'Nuevo Servicio de Mantenimiento Preventivo', 
       '¡Ahora ofrezco paquetes de mantenimiento preventivo mensual! Incluye revisión completa de instalaciones eléctricas para evitar problemas futuros.', 
       'electricity', '{}'),
      (COALESCE(master_ids[4], master_ids[1]), 'tip', 'Cómo Elegir la Pintura Correcta para tu Espacio', 
       'No todas las pinturas son iguales. Te explico las diferencias entre acabados mate, satinado y brillante, y cuándo usar cada uno.', 
       'painting', '{}'),
      (COALESCE(master_ids[5], master_ids[1]), 'showcase', 'Instalación de Sistema de Riego Automático', 
       'Instalamos un sistema de riego inteligente que ahorra hasta 50% de agua. Perfecto para jardines grandes y quienes viajan frecuentemente.', 
       'gardening', '{}');
  END IF;

  -- Insertar contenido patrocinado solo si no existe
  IF NOT EXISTS (SELECT 1 FROM sponsored_content LIMIT 1) THEN
    INSERT INTO sponsored_content (master_id, type, title, description, category, budget, start_date, end_date, is_active, cta_text, cta_url)
    VALUES 
      (master_ids[1], 'service_ad', '¡Descuento Especial en Limpieza Profunda!', 
       '20% de descuento en tu primer servicio de limpieza profunda. Válido hasta fin de mes.', 
       'cleaning', 500, now(), now() + interval '30 days', true, 'Reservar Ahora', '/search'),
      (COALESCE(master_ids[2], master_ids[1]), 'featured', 'Profesional Verificado del Mes', 
       'Con más de 100 trabajos completados y calificación 5 estrellas. Especialista en reparaciones de plomería.', 
       'plumbing', 1000, now(), now() + interval '30 days', true, 'Ver Perfil', '/search');
  END IF;
END;
$$;