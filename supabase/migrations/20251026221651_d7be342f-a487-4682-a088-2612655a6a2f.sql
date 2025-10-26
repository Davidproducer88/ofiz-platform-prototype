-- Ensure marketplace order amounts are calculated via triggers
DO $$
BEGIN
  -- Trigger to calculate order amounts before insert/update
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calculate_marketplace_order_amounts'
  ) THEN
    CREATE TRIGGER trg_calculate_marketplace_order_amounts
    BEFORE INSERT OR UPDATE OF quantity, unit_price, shipping_cost
    ON public.marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_marketplace_order_amounts();
  END IF;

  -- Trigger to validate order relationships
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validate_marketplace_order'
  ) THEN
    CREATE TRIGGER trg_validate_marketplace_order
    BEFORE INSERT OR UPDATE OF seller_id, buyer_id, product_id
    ON public.marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_marketplace_order();
  END IF;

  -- Trigger to keep updated_at fresh
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_marketplace_orders_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_marketplace_orders_updated_at
    BEFORE UPDATE ON public.marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;
