-- Actualizar políticas RLS del marketplace para restringir vendedores a solo businesses

-- 1. Actualizar política de creación de productos (solo businesses)
DROP POLICY IF EXISTS "Empresas pueden crear sus productos" ON marketplace_products;
CREATE POLICY "Solo empresas pueden crear productos"
ON marketplace_products
FOR INSERT
TO authenticated
WITH CHECK (
  business_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'business'
  )
);

-- 2. Actualizar política de actualización de productos (solo businesses propietarios)
DROP POLICY IF EXISTS "Empresas pueden actualizar sus productos" ON marketplace_products;
CREATE POLICY "Solo empresas pueden actualizar sus productos"
ON marketplace_products
FOR UPDATE
TO authenticated
USING (
  business_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'business'
  )
);

-- 3. Actualizar política de eliminación de productos (solo businesses propietarios)
DROP POLICY IF EXISTS "Empresas pueden eliminar sus productos" ON marketplace_products;
CREATE POLICY "Solo empresas pueden eliminar sus productos"
ON marketplace_products
FOR DELETE
TO authenticated
USING (
  business_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'business'
  )
);

-- 4. Productos activos visibles para todos los usuarios autenticados (clientes, maestros, businesses)
DROP POLICY IF EXISTS "Productos activos visibles para todos" ON marketplace_products;
CREATE POLICY "Productos activos visibles para todos"
ON marketplace_products
FOR SELECT
TO authenticated
USING (
  status = 'active' 
  OR business_id = auth.uid()
);

-- 5. Actualizar política de órdenes - todos los usuarios autenticados pueden crear órdenes
DROP POLICY IF EXISTS "Usuarios pueden crear órdenes" ON marketplace_orders;
CREATE POLICY "Usuarios autenticados pueden crear órdenes"
ON marketplace_orders
FOR INSERT
TO authenticated
WITH CHECK (
  buyer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- 6. Asegurar que el seller_id en órdenes coincida con el business_id del producto
CREATE OR REPLACE FUNCTION validate_marketplace_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que el seller_id corresponda al dueño del producto
  IF NOT EXISTS (
    SELECT 1 FROM marketplace_products
    WHERE id = NEW.product_id
    AND business_id = NEW.seller_id
  ) THEN
    RAISE EXCEPTION 'seller_id must match product owner';
  END IF;
  
  -- Verificar que el comprador no sea el vendedor
  IF NEW.buyer_id = NEW.seller_id THEN
    RAISE EXCEPTION 'buyer cannot be the seller';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_marketplace_order_trigger ON marketplace_orders;
CREATE TRIGGER validate_marketplace_order_trigger
BEFORE INSERT ON marketplace_orders
FOR EACH ROW
EXECUTE FUNCTION validate_marketplace_order();

-- 7. Agregar campo para mercadopago_payment_id en marketplace_orders si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_orders' 
    AND column_name = 'mercadopago_payment_id'
  ) THEN
    ALTER TABLE marketplace_orders 
    ADD COLUMN mercadopago_payment_id text;
  END IF;
END $$;

-- 8. Agregar campo para mercadopago_preference_id en marketplace_orders si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_orders' 
    AND column_name = 'mercadopago_preference_id'
  ) THEN
    ALTER TABLE marketplace_orders 
    ADD COLUMN mercadopago_preference_id text;
  END IF;
END $$;