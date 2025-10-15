-- Actualizar enum user_type para incluir 'business'
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'business';

-- Tabla de perfiles de empresas
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL, -- 'hardware_store', 'construction', 'property_management', 'other'
  tax_id TEXT, -- RUT/CUIT
  industry TEXT,
  website TEXT,
  company_size TEXT, -- 'small', 'medium', 'large'
  billing_address TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de suscripciones empresariales
CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'professional', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  price NUMERIC NOT NULL,
  monthly_contacts_limit INTEGER NOT NULL DEFAULT 50,
  contacts_used INTEGER NOT NULL DEFAULT 0,
  can_post_ads BOOLEAN NOT NULL DEFAULT FALSE,
  ad_impressions_limit INTEGER DEFAULT 0,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  mercadopago_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- Tabla de anuncios publicitarios
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ad_type TEXT NOT NULL, -- 'banner', 'sidebar', 'feed_sponsored', 'dashboard_promo'
  target_audience TEXT NOT NULL, -- 'masters', 'clients', 'all'
  category service_category, -- filtrar por categoría de servicio
  media_url TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Ver más',
  cta_url TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  cost_per_impression NUMERIC NOT NULL DEFAULT 0.10,
  impressions_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'paused', 'completed', 'rejected'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de contratos/encargos empresariales
CREATE TABLE IF NOT EXISTS public.business_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category service_category NOT NULL,
  location TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  required_masters INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de aplicaciones de maestros a contratos empresariales
CREATE TABLE IF NOT EXISTS public.business_contract_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.business_contracts(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  message TEXT,
  proposed_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contract_id, master_id)
);

-- RLS Policies para business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view own profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Businesses can insert own profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Businesses can update own profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- RLS Policies para business_subscriptions
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can view own subscription"
  ON public.business_subscriptions FOR SELECT
  USING (business_id = auth.uid() OR is_admin());

CREATE POLICY "Businesses can insert own subscription"
  ON public.business_subscriptions FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Businesses can update own subscription"
  ON public.business_subscriptions FOR UPDATE
  USING (business_id = auth.uid() OR is_admin());

-- RLS Policies para advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can manage own ads"
  ON public.advertisements FOR ALL
  USING (business_id = auth.uid() OR is_admin());

CREATE POLICY "Active ads are visible to all"
  ON public.advertisements FOR SELECT
  USING (status = 'active' AND is_active = true AND start_date <= NOW() AND end_date >= NOW());

-- RLS Policies para business_contracts
ALTER TABLE public.business_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses can manage own contracts"
  ON public.business_contracts FOR ALL
  USING (business_id = auth.uid() OR is_admin());

CREATE POLICY "Masters can view open contracts"
  ON public.business_contracts FOR SELECT
  USING (status = 'open' OR EXISTS (
    SELECT 1 FROM masters WHERE id = auth.uid()
  ));

-- RLS Policies para business_contract_applications
ALTER TABLE public.business_contract_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Masters can create applications"
  ON public.business_contract_applications FOR INSERT
  WITH CHECK (master_id = auth.uid());

CREATE POLICY "Masters can view own applications"
  ON public.business_contract_applications FOR SELECT
  USING (master_id = auth.uid() OR is_admin());

CREATE POLICY "Business owners can view applications to their contracts"
  ON public.business_contract_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM business_contracts 
    WHERE id = contract_id AND business_id = auth.uid()
  ));

CREATE POLICY "Business owners can update application status"
  ON public.business_contract_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM business_contracts 
    WHERE id = contract_id AND business_id = auth.uid()
  ));

-- Triggers para updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON public.business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_contracts_updated_at
  BEFORE UPDATE ON public.business_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_contract_applications_updated_at
  BEFORE UPDATE ON public.business_contract_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();