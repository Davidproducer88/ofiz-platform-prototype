-- =============================================
-- GAMIFICACIÓN: Sistema de Badges, Niveles y Logros
-- =============================================

-- Tabla de insignias/badges disponibles
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- nombre del icono de lucide
  category TEXT NOT NULL DEFAULT 'achievement', -- achievement, milestone, special
  points INTEGER NOT NULL DEFAULT 100,
  requirements JSONB DEFAULT '{}', -- criterios para obtener el badge
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Badges obtenidos por usuarios
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Niveles de usuario
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  total_badges INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Historial de puntos (para tracking)
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'booking_completed', 'review_given', 'badge_earned', etc
  reference_id UUID, -- ID del booking, review, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar badges iniciales
INSERT INTO public.badges (name, description, icon, category, points, requirements) VALUES
-- Badges de clientes
('Primera Reserva', 'Completaste tu primera reserva', 'Calendar', 'milestone', 50, '{"type": "bookings", "count": 1}'),
('Cliente Frecuente', 'Completaste 5 reservas', 'Star', 'milestone', 100, '{"type": "bookings", "count": 5}'),
('Super Cliente', 'Completaste 10 reservas', 'Crown', 'milestone', 200, '{"type": "bookings", "count": 10}'),
('Crítico Constructivo', 'Dejaste tu primera reseña', 'MessageSquare', 'achievement', 25, '{"type": "reviews", "count": 1}'),
('Voz de la Comunidad', 'Dejaste 5 reseñas', 'Users', 'achievement', 75, '{"type": "reviews", "count": 5}'),
('Explorador', 'Probaste 3 categorías diferentes', 'Compass', 'achievement', 100, '{"type": "categories", "count": 3}'),
-- Badges de profesionales
('Primer Trabajo', 'Completaste tu primer trabajo', 'Hammer', 'milestone', 50, '{"type": "jobs_completed", "count": 1}'),
('Profesional Dedicado', 'Completaste 10 trabajos', 'Award', 'milestone', 150, '{"type": "jobs_completed", "count": 10}'),
('Maestro del Oficio', 'Completaste 50 trabajos', 'Trophy', 'milestone', 500, '{"type": "jobs_completed", "count": 50}'),
('Respuesta Rápida', 'Respondiste en menos de 1 hora', 'Zap', 'achievement', 50, '{"type": "response_time", "hours": 1}'),
('5 Estrellas', 'Mantuviste 5 estrellas en 10+ reseñas', 'Sparkles', 'achievement', 200, '{"type": "rating", "min": 5, "reviews": 10}'),
('Top 10', 'Entraste al ranking Top 10', 'Medal', 'special', 300, '{"type": "ranking", "position": 10}'),
-- Badges especiales
('Fundador', 'Sos uno de los primeros usuarios', 'Heart', 'special', 500, '{"type": "founder"}'),
('Verificado', 'Completaste la verificación de identidad', 'ShieldCheck', 'achievement', 100, '{"type": "verified"}'),
('Fiel Usuario', 'Más de 6 meses activo', 'Clock', 'milestone', 150, '{"type": "tenure_months", "count": 6}');

-- Habilitar RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Políticas para badges (lectura pública)
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (is_active = true);

-- Políticas para user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users badges" ON public.user_badges
  FOR SELECT USING (true);

-- Políticas para user_levels
CREATE POLICY "Users can view their own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view user levels" ON public.user_levels
  FOR SELECT USING (true);

CREATE POLICY "System can insert levels" ON public.user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update levels" ON public.user_levels
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para points_history
CREATE POLICY "Users can view their own points" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

-- Función para calcular nivel basado en XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Niveles: 1=0, 2=100, 3=300, 4=600, 5=1000, 6=1500, 7=2100, 8=2800, 9=3600, 10=4500
  IF xp >= 4500 THEN RETURN 10;
  ELSIF xp >= 3600 THEN RETURN 9;
  ELSIF xp >= 2800 THEN RETURN 8;
  ELSIF xp >= 2100 THEN RETURN 7;
  ELSIF xp >= 1500 THEN RETURN 6;
  ELSIF xp >= 1000 THEN RETURN 5;
  ELSIF xp >= 600 THEN RETURN 4;
  ELSIF xp >= 300 THEN RETURN 3;
  ELSIF xp >= 100 THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para agregar puntos a un usuario
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Crear registro de nivel si no existe
  INSERT INTO user_levels (user_id, experience_points, current_level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Agregar puntos al historial
  INSERT INTO points_history (user_id, points, reason, reference_id)
  VALUES (p_user_id, p_points, p_reason, p_reference_id);
  
  -- Actualizar XP y nivel
  UPDATE user_levels
  SET experience_points = experience_points + p_points,
      current_level = calculate_level(experience_points + p_points),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING experience_points INTO v_new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para otorgar badge de fundador
CREATE OR REPLACE FUNCTION public.check_founder_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_founder = true THEN
    -- Otorgar badge de fundador
    INSERT INTO user_badges (user_id, badge_id)
    SELECT NEW.id, b.id
    FROM badges b
    WHERE b.name = 'Fundador'
    ON CONFLICT DO NOTHING;
    
    -- Agregar puntos
    PERFORM add_user_points(NEW.id, 500, 'founder_badge');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_founder_status_change
  AFTER INSERT OR UPDATE OF is_founder ON profiles
  FOR EACH ROW
  WHEN (NEW.is_founder = true)
  EXECUTE FUNCTION check_founder_badge();