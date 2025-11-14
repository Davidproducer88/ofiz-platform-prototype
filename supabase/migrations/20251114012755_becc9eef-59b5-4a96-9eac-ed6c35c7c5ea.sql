-- Tabla para registrar violaciones de seguridad en el chat
CREATE TABLE IF NOT EXISTS public.message_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  violation_type TEXT NOT NULL, -- 'phone', 'email', 'social_media', 'external_contact', 'suspicious'
  detected_info JSONB, -- Información específica detectada
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  action_taken TEXT NOT NULL DEFAULT 'blocked', -- 'blocked', 'censored', 'warned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_reviewed BOOLEAN DEFAULT false,
  admin_notes TEXT
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_message_violations_sender ON public.message_violations(sender_id);
CREATE INDEX idx_message_violations_conversation ON public.message_violations(conversation_id);
CREATE INDEX idx_message_violations_type ON public.message_violations(violation_type);
CREATE INDEX idx_message_violations_severity ON public.message_violations(severity);
CREATE INDEX idx_message_violations_created ON public.message_violations(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.message_violations ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver todas las violaciones
CREATE POLICY "Admins can view all violations"
ON public.message_violations
FOR SELECT
TO authenticated
USING (is_admin());

-- Política: Sistema puede insertar violaciones
CREATE POLICY "System can insert violations"
ON public.message_violations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Tabla para contador de advertencias por usuario
CREATE TABLE IF NOT EXISTS public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_count INTEGER NOT NULL DEFAULT 0,
  last_warning_at TIMESTAMPTZ,
  suspended_until TIMESTAMPTZ,
  permanently_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX idx_user_warnings_user ON public.user_warnings(user_id);
CREATE INDEX idx_user_warnings_suspended ON public.user_warnings(suspended_until) WHERE suspended_until IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver sus propias advertencias
CREATE POLICY "Users can view own warnings"
ON public.user_warnings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Admins pueden ver todas las advertencias
CREATE POLICY "Admins can view all warnings"
ON public.user_warnings
FOR SELECT
TO authenticated
USING (is_admin());

-- Política: Sistema puede actualizar advertencias
CREATE POLICY "System can update warnings"
ON public.user_warnings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_warnings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_warnings_updated_at ON public.user_warnings;
CREATE TRIGGER update_user_warnings_updated_at
  BEFORE UPDATE ON public.user_warnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_warnings_updated_at();

-- Añadir campo a mensajes para marcar mensajes bloqueados/censurados
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS censored BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS block_reason TEXT;