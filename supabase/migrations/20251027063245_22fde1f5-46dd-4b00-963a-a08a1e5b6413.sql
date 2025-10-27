-- Revertir todas las comisiones a 5% (pricing correcto)

-- 1. Actualizar función de cálculo de comisión de pagos a 5%
CREATE OR REPLACE FUNCTION public.calculate_payment_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular comisión del 5%
  NEW.commission_amount := ROUND(NEW.amount * 0.05, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$$;

-- 2. Actualizar función de cálculo para órdenes de marketplace a 5%
CREATE OR REPLACE FUNCTION public.calculate_marketplace_order_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular subtotal
  NEW.subtotal := NEW.unit_price * NEW.quantity;
  
  -- Calcular comisión de plataforma (5%)
  NEW.platform_fee := ROUND(NEW.subtotal * 0.05, 2);
  
  -- Calcular monto para el vendedor
  NEW.seller_amount := NEW.subtotal - NEW.platform_fee;
  
  -- Calcular total incluyendo envío
  NEW.total_amount := NEW.subtotal + COALESCE(NEW.shipping_cost, 0);
  
  RETURN NEW;
END;
$$;

-- 3. Actualizar el default de platform_commission_rate a 5%
ALTER TABLE public.marketplace_transactions 
ALTER COLUMN platform_commission_rate SET DEFAULT 0.05;

-- 4. Actualizar registros existentes de transacciones a 5%
UPDATE public.marketplace_transactions 
SET 
  platform_commission_rate = 0.05,
  platform_commission_amount = ROUND(amount * 0.05, 2),
  seller_net_amount = amount - ROUND(amount * 0.05, 2)
WHERE platform_commission_rate != 0.05;

-- 5. Actualizar órdenes existentes del marketplace con comisión 5%
UPDATE public.marketplace_orders
SET 
  platform_fee = ROUND(subtotal * 0.05, 2),
  seller_amount = subtotal - ROUND(subtotal * 0.05, 2)
WHERE platform_fee != ROUND(subtotal * 0.05, 2);

-- 6. Actualizar comisiones existentes en tabla commissions a 5%
UPDATE public.commissions
SET 
  percentage = 5.00,
  amount = ROUND((SELECT amount FROM payments WHERE payments.id = commissions.payment_id) * 0.05, 2)
WHERE percentage != 5.00;