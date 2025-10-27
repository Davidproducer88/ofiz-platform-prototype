-- Actualizar comisión de marketplace de 12% a 7%
-- Actualizar el valor por defecto en marketplace_transactions
ALTER TABLE marketplace_transactions 
ALTER COLUMN platform_commission_rate SET DEFAULT 0.07;

-- Actualizar las comisiones existentes pendientes a 7%
UPDATE marketplace_transactions 
SET 
  platform_commission_rate = 0.07,
  platform_commission_amount = ROUND(amount * 0.07, 2),
  seller_net_amount = amount - ROUND(amount * 0.07, 2)
WHERE status = 'pending';

-- Actualizar función trigger para usar 7% en pagos de servicios
CREATE OR REPLACE FUNCTION calculate_payment_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calcular comisión del 7%
  NEW.commission_amount := ROUND(NEW.amount * 0.07, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$function$;

-- Actualizar función trigger para marketplace orders (7%)
CREATE OR REPLACE FUNCTION calculate_marketplace_order_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular subtotal
  NEW.subtotal := NEW.unit_price * NEW.quantity;
  
  -- Calcular comisión de plataforma (7%)
  NEW.platform_fee := ROUND(NEW.subtotal * 0.07, 2);
  
  -- Calcular monto para el vendedor
  NEW.seller_amount := NEW.subtotal - NEW.platform_fee;
  
  -- Calcular total incluyendo envío
  NEW.total_amount := NEW.subtotal + COALESCE(NEW.shipping_cost, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;