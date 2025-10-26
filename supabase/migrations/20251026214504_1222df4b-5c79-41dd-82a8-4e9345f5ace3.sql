-- Corregir la función validate_marketplace_order para incluir search_path
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public';