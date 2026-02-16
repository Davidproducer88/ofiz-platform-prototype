
-- Create platform configuration table (key-value store)
CREATE TABLE public.platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can read platform config"
  ON public.platform_config FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert platform config"
  ON public.platform_config FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update platform config"
  ON public.platform_config FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete platform config"
  ON public.platform_config FOR DELETE
  USING (is_admin());

-- Seed default values
INSERT INTO public.platform_config (key, value, description) VALUES
  ('platform_commission', '5'::jsonb, 'Porcentaje de comisión de la plataforma'),
  ('founder_discount', '20'::jsonb, 'Porcentaje de descuento para fundadores'),
  ('referral_credit', '5000'::jsonb, 'Crédito en CLP por referido exitoso'),
  ('max_free_applications', '3'::jsonb, 'Aplicaciones mensuales en plan gratuito'),
  ('max_founders', '1000'::jsonb, 'Número máximo de fundadores'),
  ('maintenance_mode', 'false'::jsonb, 'Modo mantenimiento activado'),
  ('registration_enabled', 'true'::jsonb, 'Registro de nuevos usuarios habilitado'),
  ('email_notifications_enabled', 'true'::jsonb, 'Envío de emails transaccionales habilitado');
