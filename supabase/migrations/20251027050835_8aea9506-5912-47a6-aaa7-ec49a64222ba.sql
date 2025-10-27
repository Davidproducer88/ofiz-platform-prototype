-- Actualizar función de cálculo de comisión de pagos a 5%
CREATE OR REPLACE FUNCTION public.calculate_payment_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calcular comisión del 5%
  NEW.commission_amount := ROUND(NEW.amount * 0.05, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$function$;