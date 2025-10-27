-- Actualizar todas las comisiones a 12% según pricing correcto

-- 1. Actualizar función de cálculo de comisión de pagos a 12%
CREATE OR REPLACE FUNCTION public.calculate_payment_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular comisión del 12%
  NEW.commission_amount := ROUND(NEW.amount * 0.12, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$$;

-- 2. Actualizar función de cálculo para órdenes de marketplace a 12%
CREATE OR REPLACE FUNCTION public.calculate_marketplace_order_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Actualizar el default de platform_commission_rate a 12%
ALTER TABLE public.marketplace_transactions 
ALTER COLUMN platform_commission_rate SET DEFAULT 0.12;

-- 4. Actualizar registros existentes de transacciones a 12%
UPDATE public.marketplace_transactions 
SET 
  platform_commission_rate = 0.12,
  platform_commission_amount = ROUND(amount * 0.12, 2),
  seller_net_amount = amount - ROUND(amount * 0.12, 2)
WHERE platform_commission_rate != 0.12;

-- 5. Actualizar órdenes existentes del marketplace con nueva comisión
UPDATE public.marketplace_orders
SET 
  platform_fee = ROUND(subtotal * 0.12, 2),
  seller_amount = subtotal - ROUND(subtotal * 0.12, 2)
WHERE platform_fee != ROUND(subtotal * 0.12, 2);

-- 6. Actualizar comisiones existentes en tabla commissions
UPDATE public.commissions
SET 
  percentage = 12.00,
  amount = ROUND((SELECT amount FROM payments WHERE payments.id = commissions.payment_id) * 0.12, 2)
WHERE percentage != 12.00;