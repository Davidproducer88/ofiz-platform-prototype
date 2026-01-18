-- Fix functions without search_path for security

-- Fix calculate_level function
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix add_user_points function
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_xp INTEGER;
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
$$;

-- Fix check_founder_badge trigger function
CREATE OR REPLACE FUNCTION public.check_founder_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_founder = true AND (OLD IS NULL OR OLD.is_founder = false) THEN
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
$$;