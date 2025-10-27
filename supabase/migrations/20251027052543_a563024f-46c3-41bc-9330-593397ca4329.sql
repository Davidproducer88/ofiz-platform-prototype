-- Crear tabla para servicios dinámicos/temporales creados desde chat
CREATE TABLE IF NOT EXISTS service_from_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  master_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT service_from_chat_price_positive CHECK (price > 0)
);

-- RLS para service_from_chat
ALTER TABLE service_from_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service_from_chat"
ON service_from_chat
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Masters can create service_from_chat"
ON service_from_chat
FOR INSERT
TO authenticated
WITH CHECK (master_id = auth.uid() OR EXISTS (
  SELECT 1 FROM conversations
  WHERE master_id = auth.uid() OR client_id = auth.uid()
));

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_service_from_chat_master ON service_from_chat(master_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);