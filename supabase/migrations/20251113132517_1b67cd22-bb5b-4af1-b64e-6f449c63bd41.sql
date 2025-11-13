-- Tabla de códigos de descuento para fundadores
CREATE TABLE IF NOT EXISTS public.founder_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percentage NUMERIC NOT NULL DEFAULT 10,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT code_format CHECK (code ~ '^[A-Z0-9]{6,12}$')
);

ALTER TABLE public.founder_discount_codes ENABLE ROW LEVEL SECURITY;

-- Índices para optimizar búsquedas
CREATE INDEX idx_founder_codes_user ON public.founder_discount_codes(user_id);
CREATE INDEX idx_founder_codes_code ON public.founder_discount_codes(code);
CREATE INDEX idx_founder_codes_active ON public.founder_discount_codes(is_active);

-- RLS Policies
CREATE POLICY "Users can view own discount codes"
ON public.founder_discount_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage all codes"
ON public.founder_discount_codes
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Tabla de tracking de uso de códigos
CREATE TABLE IF NOT EXISTS public.founder_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.founder_discount_codes(id) ON DELETE CASCADE,
  used_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.founder_code_usage ENABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX idx_code_usage_code ON public.founder_code_usage(code_id);
CREATE INDEX idx_code_usage_user ON public.founder_code_usage(used_by_user_id);
CREATE INDEX idx_code_usage_booking ON public.founder_code_usage(booking_id);

-- RLS Policies
CREATE POLICY "Users can view own code usage"
ON public.founder_code_usage
FOR SELECT
TO authenticated
USING (
  auth.uid() = used_by_user_id 
  OR auth.uid() IN (
    SELECT user_id FROM public.founder_discount_codes WHERE id = code_id
  )
  OR is_admin()
);

CREATE POLICY "System can insert code usage"
ON public.founder_code_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = used_by_user_id);

-- Función para generar código único de fundador
CREATE OR REPLACE FUNCTION public.generate_founder_code(founder_user_id UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  profile_name TEXT;
BEGIN
  -- Obtener nombre del usuario para personalizar el código
  SELECT UPPER(SUBSTRING(REPLACE(full_name, ' ', ''), 1, 4))
  INTO profile_name
  FROM public.profiles
  WHERE id = founder_user_id;
  
  LOOP
    -- Generar código: 4 letras del nombre + 6 caracteres aleatorios
    new_code := profile_name || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    
    -- Verificar si existe
    SELECT EXISTS(
      SELECT 1 FROM public.founder_discount_codes WHERE code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Función para crear código de descuento de fundador automáticamente
CREATE OR REPLACE FUNCTION public.create_founder_discount_code()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Solo crear código si se convierte en fundador
  IF NEW.is_founder = true AND (OLD.is_founder IS NULL OR OLD.is_founder = false) THEN
    -- Generar código único
    new_code := generate_founder_code(NEW.id);
    
    -- Crear código de descuento
    INSERT INTO public.founder_discount_codes (
      user_id,
      code,
      discount_percentage,
      description,
      is_active,
      max_uses,
      valid_until
    ) VALUES (
      NEW.id,
      new_code,
      COALESCE(NEW.founder_discount_percentage, 10),
      'Código de fundador - Beneficio Lifetime',
      true,
      NULL, -- Sin límite de usos
      NULL  -- Sin fecha de expiración
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para crear código automáticamente
DROP TRIGGER IF EXISTS create_founder_code_trigger ON public.profiles;
CREATE TRIGGER create_founder_code_trigger
AFTER INSERT OR UPDATE OF is_founder ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_founder_discount_code();

-- Función para validar y aplicar código de descuento
CREATE OR REPLACE FUNCTION public.validate_founder_code(
  code_to_validate TEXT,
  user_id_param UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  code_record RECORD;
  result JSONB;
BEGIN
  -- Buscar código
  SELECT * INTO code_record
  FROM public.founder_discount_codes
  WHERE code = UPPER(code_to_validate)
  AND is_active = true
  AND (valid_from IS NULL OR valid_from <= NOW())
  AND (valid_until IS NULL OR valid_until >= NOW());
  
  -- Verificar si existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Código inválido o expirado'
    );
  END IF;
  
  -- Verificar límite de usos
  IF code_record.max_uses IS NOT NULL 
     AND code_record.times_used >= code_record.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Código ha alcanzado el límite de usos'
    );
  END IF;
  
  -- Código válido
  RETURN jsonb_build_object(
    'valid', true,
    'code_id', code_record.id,
    'discount_percentage', code_record.discount_percentage,
    'description', code_record.description,
    'owner_user_id', code_record.user_id
  );
END;
$$;

-- Función para registrar uso de código
CREATE OR REPLACE FUNCTION public.use_founder_code(
  code_id_param UUID,
  used_by_user_id_param UUID,
  booking_id_param UUID,
  discount_amount_param NUMERIC
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Registrar uso
  INSERT INTO public.founder_code_usage (
    code_id,
    used_by_user_id,
    booking_id,
    discount_amount
  ) VALUES (
    code_id_param,
    used_by_user_id_param,
    booking_id_param,
    discount_amount_param
  );
  
  -- Incrementar contador
  UPDATE public.founder_discount_codes
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = code_id_param;
  
  RETURN true;
END;
$$;