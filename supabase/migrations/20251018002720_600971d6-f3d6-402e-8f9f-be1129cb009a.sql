-- Function to initialize/recalculate all master rankings
CREATE OR REPLACE FUNCTION public.recalculate_all_rankings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_record RECORD;
BEGIN
  -- Loop through all masters and calculate their rankings
  FOR master_record IN 
    SELECT id FROM masters
  LOOP
    PERFORM calculate_master_ranking(master_record.id);
  END LOOP;
END;
$$;

-- Initialize rankings for all existing masters
SELECT recalculate_all_rankings();

-- Fix the trigger functions to handle NULL cases better
CREATE OR REPLACE FUNCTION public.update_ranking_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.master_id IS NOT NULL THEN
    PERFORM calculate_master_ranking(NEW.master_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ranking_on_booking_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NEW.master_id IS NOT NULL THEN
      PERFORM calculate_master_ranking(NEW.master_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_ranking_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    IF NEW.master_id IS NOT NULL THEN
      PERFORM calculate_master_ranking(NEW.master_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;