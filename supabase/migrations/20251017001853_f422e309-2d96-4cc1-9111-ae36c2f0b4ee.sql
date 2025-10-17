-- Tabla de maestros favoritos
CREATE TABLE public.favorite_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  master_id uuid REFERENCES public.masters(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(client_id, master_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_favorite_masters_client_id ON public.favorite_masters(client_id);
CREATE INDEX idx_favorite_masters_master_id ON public.favorite_masters(master_id);

-- RLS para favorite_masters
ALTER TABLE public.favorite_masters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
ON public.favorite_masters FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own favorites"
ON public.favorite_masters FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can delete own favorites"
ON public.favorite_masters FOR DELETE
USING (auth.uid() = client_id);

-- Tabla de direcciones del cliente
CREATE TABLE public.client_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  address text NOT NULL,
  city text,
  latitude numeric,
  longitude numeric,
  is_default boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Índice para direcciones
CREATE INDEX idx_client_addresses_client_id ON public.client_addresses(client_id);

-- RLS para client_addresses
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
ON public.client_addresses FOR ALL
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Función para actualizar updated_at en addresses
CREATE OR REPLACE FUNCTION public.update_client_address_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_client_addresses_updated_at
BEFORE UPDATE ON public.client_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_client_address_updated_at();