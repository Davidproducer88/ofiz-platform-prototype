-- Actualizar función de cálculo de comisiones a 12%
CREATE OR REPLACE FUNCTION public.calculate_payment_amounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate 12% commission
  NEW.commission_amount := ROUND(NEW.amount * 0.12, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$function$;