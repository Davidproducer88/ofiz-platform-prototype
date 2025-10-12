-- Fix security warning: Add search_path to calculate_payment_amounts function
CREATE OR REPLACE FUNCTION calculate_payment_amounts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate 5% commission
  NEW.commission_amount := ROUND(NEW.amount * 0.05, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$$;