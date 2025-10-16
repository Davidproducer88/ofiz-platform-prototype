-- Tabla de códigos de referido
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Tabla de referidos completados
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed')),
  UNIQUE(referred_id)
);

-- Tabla de créditos de referido
CREATE TABLE public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('referrer_bonus', 'welcome_bonus')),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT false NOT NULL,
  used_in_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies para referral_codes
CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active codes for validation"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies para referrals
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON public.referrals FOR UPDATE
  USING (true);

-- RLS Policies para referral_credits
CREATE POLICY "Users can view own credits"
  ON public.referral_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits"
  ON public.referral_credits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own credits"
  ON public.referral_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código de 8 caracteres (letras mayúsculas y números)
    new_code := upper(substr(md5(random()::text || user_id_param::text), 1, 8));
    
    -- Verificar si el código ya existe
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Trigger para crear código de referido cuando un cliente se registra
CREATE OR REPLACE FUNCTION create_referral_code_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Solo crear código para clientes
  IF NEW.user_type = 'client' THEN
    new_code := generate_referral_code(NEW.id);
    
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (NEW.id, new_code);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_referral_code_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_for_user();

-- Índices para mejorar rendimiento
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referral_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX idx_referral_credits_used ON public.referral_credits(used);