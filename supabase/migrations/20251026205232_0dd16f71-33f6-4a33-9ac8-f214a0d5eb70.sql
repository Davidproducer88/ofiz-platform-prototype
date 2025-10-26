-- Crear tabla de categorías de marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_category_id UUID REFERENCES public.marketplace_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de productos del marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.marketplace_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  sku TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  shipping_info JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'out_of_stock', 'archived')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de órdenes del marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  seller_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  notes TEXT,
  cancelled_reason TEXT,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de transacciones del marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'commission', 'refund', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  platform_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.12,
  platform_commission_amount DECIMAL(10,2) NOT NULL,
  seller_net_amount DECIMAL(10,2) NOT NULL,
  payment_provider TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de reseñas de productos
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.marketplace_orders(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  seller_response TEXT,
  seller_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de favoritos de productos
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Crear tabla de balance de vendedores
CREATE TABLE IF NOT EXISTS public.marketplace_seller_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  last_withdrawal_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_marketplace_products_business ON public.marketplace_products(business_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_featured ON public.marketplace_products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller ON public.marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_payment_status ON public.marketplace_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_order ON public.marketplace_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_product ON public.marketplace_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user ON public.marketplace_favorites(user_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_seller_balance ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorías (público read)
CREATE POLICY "Categorías visibles para todos"
  ON public.marketplace_categories FOR SELECT
  USING (true);

-- Políticas RLS para productos
CREATE POLICY "Productos activos visibles para todos"
  ON public.marketplace_products FOR SELECT
  USING (status = 'active' OR business_id = auth.uid());

CREATE POLICY "Empresas pueden crear sus productos"
  ON public.marketplace_products FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Empresas pueden actualizar sus productos"
  ON public.marketplace_products FOR UPDATE
  USING (business_id = auth.uid());

CREATE POLICY "Empresas pueden eliminar sus productos"
  ON public.marketplace_products FOR DELETE
  USING (business_id = auth.uid());

-- Políticas RLS para órdenes
CREATE POLICY "Usuarios pueden ver sus órdenes como compradores"
  ON public.marketplace_orders FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Usuarios pueden crear órdenes"
  ON public.marketplace_orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Vendedores pueden actualizar órdenes de sus productos"
  ON public.marketplace_orders FOR UPDATE
  USING (seller_id = auth.uid());

-- Políticas RLS para transacciones
CREATE POLICY "Usuarios pueden ver sus transacciones"
  ON public.marketplace_transactions FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.marketplace_orders
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- Políticas RLS para reseñas
CREATE POLICY "Reseñas visibles para todos"
  ON public.marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Compradores pueden crear reseñas"
  ON public.marketplace_reviews FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Compradores pueden actualizar sus reseñas"
  ON public.marketplace_reviews FOR UPDATE
  USING (buyer_id = auth.uid());

-- Políticas RLS para favoritos
CREATE POLICY "Usuarios pueden ver sus favoritos"
  ON public.marketplace_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden agregar favoritos"
  ON public.marketplace_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden eliminar sus favoritos"
  ON public.marketplace_favorites FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para balance de vendedores
CREATE POLICY "Vendedores pueden ver su balance"
  ON public.marketplace_seller_balance FOR SELECT
  USING (seller_id = auth.uid());

-- Función para calcular comisiones y montos de órdenes
CREATE OR REPLACE FUNCTION public.calculate_marketplace_order_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular subtotal
  NEW.subtotal := NEW.unit_price * NEW.quantity;
  
  -- Calcular comisión de plataforma (12%)
  NEW.platform_fee := ROUND(NEW.subtotal * 0.12, 2);
  
  -- Calcular monto para el vendedor
  NEW.seller_amount := NEW.subtotal - NEW.platform_fee;
  
  -- Calcular total incluyendo envío
  NEW.total_amount := NEW.subtotal + COALESCE(NEW.shipping_cost, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para calcular montos automáticamente
CREATE TRIGGER calculate_order_amounts_trigger
  BEFORE INSERT OR UPDATE ON public.marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_marketplace_order_amounts();

-- Función para actualizar rating de productos
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.marketplace_products
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.marketplace_reviews
      WHERE product_id = NEW.product_id
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.marketplace_reviews
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar rating
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.marketplace_orders WHERE order_number = new_number) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_marketplace_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para actualizar timestamp
CREATE TRIGGER update_marketplace_products_timestamp
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_timestamp();

CREATE TRIGGER update_marketplace_orders_timestamp
  BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_timestamp();

-- Insertar categorías iniciales
INSERT INTO public.marketplace_categories (name, description, icon) VALUES
  ('Equipamiento', 'Herramientas y equipamiento profesional', '🛠️'),
  ('Materiales', 'Materiales de construcción y reparación', '🧱'),
  ('Uniformes', 'Ropa de trabajo y uniformes', '👔'),
  ('Tecnología', 'Software y equipamiento tecnológico', '💻'),
  ('Vehículos', 'Vehículos y accesorios de trabajo', '🚗'),
  ('Servicios', 'Servicios para empresas', '📋'),
  ('Formación', 'Cursos y capacitación', '📚'),
  ('Seguros', 'Seguros y protección', '🛡️')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE public.marketplace_products IS 'Productos del marketplace empresarial';
COMMENT ON TABLE public.marketplace_orders IS 'Órdenes de compra del marketplace';
COMMENT ON TABLE public.marketplace_transactions IS 'Transacciones financieras con comisiones de plataforma';
COMMENT ON TABLE public.marketplace_seller_balance IS 'Balance y ganancias de vendedores';