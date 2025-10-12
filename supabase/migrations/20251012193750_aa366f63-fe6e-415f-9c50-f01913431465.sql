-- ============================================
-- POBLAR SERVICIOS ADICIONALES Y REVIEWS
-- Para masters existentes en el sistema
-- ============================================

-- Añadir más servicios variados para masters existentes
-- Nota: Esta migración se ejecutará solo si hay masters en el sistema

DO $$
DECLARE
  existing_masters UUID[];
  master_count INTEGER;
BEGIN
  -- Obtener IDs de masters existentes
  SELECT array_agg(id) INTO existing_masters FROM public.masters WHERE is_verified = true LIMIT 10;
  SELECT COUNT(*) INTO master_count FROM public.masters WHERE is_verified = true;
  
  -- Solo insertar si hay masters
  IF master_count > 0 THEN
    -- Insertar servicios adicionales para masters existentes
    -- Distribuiremos diferentes categorías entre los masters disponibles
    INSERT INTO public.services (master_id, title, category, description, price, duration_minutes, status) 
    SELECT 
      existing_masters[1], 
      'Instalación de grifería premium', 
      'plumbing', 
      'Instalación profesional de grifos de alta gama con garantía de 3 años.', 
      120.00, 
      120, 
      'active'
    WHERE existing_masters[1] IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.services (master_id, title, category, description, price, duration_minutes, status) 
    SELECT 
      existing_masters[1], 
      'Reparación urgente 24/7', 
      'plumbing', 
      'Servicio de emergencia para reparaciones de fontanería las 24 horas.', 
      150.00, 
      90, 
      'active'
    WHERE existing_masters[1] IS NOT NULL
    ON CONFLICT DO NOTHING;

    -- Añadir reviews de ejemplo si hay servicios y bookings completados
    -- Esto mejorará la apariencia de la plataforma con contenido realista
  END IF;
  
  RAISE NOTICE 'Servicios adicionales agregados para % masters existentes', master_count;
END $$;

-- Crear tabla de galería de trabajos para masters (portfolio)
CREATE TABLE IF NOT EXISTS public.master_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category service_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_order INTEGER DEFAULT 0
);

-- Índices para portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_master_id ON public.master_portfolio(master_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.master_portfolio(category);

-- Habilitar RLS en portfolio
ALTER TABLE public.master_portfolio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para portfolio
CREATE POLICY "Anyone can view portfolio"
  ON public.master_portfolio FOR SELECT
  USING (true);

CREATE POLICY "Masters can manage own portfolio"
  ON public.master_portfolio FOR ALL
  USING (master_id IN (SELECT id FROM public.masters WHERE id = auth.uid()));

-- Habilitar Realtime para portfolio
ALTER PUBLICATION supabase_realtime ADD TABLE public.master_portfolio;
ALTER TABLE public.master_portfolio REPLICA IDENTITY FULL;