-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_master_rating ON public.reviews(master_id, rating);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_master_status ON public.bookings(master_id, status);

-- Create a materialized view for master rankings (updated in real-time via trigger)
CREATE TABLE IF NOT EXISTS public.master_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID UNIQUE NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  ranking_score NUMERIC NOT NULL DEFAULT 0,
  total_completed_jobs INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  response_time_hours NUMERIC,
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  rank_position INTEGER,
  CONSTRAINT ranking_score_check CHECK (ranking_score >= 0),
  CONSTRAINT average_rating_check CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- Enable RLS
ALTER TABLE public.master_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_rankings
CREATE POLICY "Anyone can view rankings"
  ON public.master_rankings FOR SELECT
  USING (true);

CREATE POLICY "Only system can modify rankings"
  ON public.master_rankings FOR ALL
  USING (false);

-- Function to calculate master ranking score
CREATE OR REPLACE FUNCTION public.calculate_master_ranking(master_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_jobs INTEGER;
  v_completed_jobs INTEGER;
  v_avg_rating NUMERIC;
  v_total_earnings NUMERIC;
  v_completion_rate NUMERIC;
  v_ranking_score NUMERIC;
BEGIN
  -- Get total jobs
  SELECT COUNT(*) INTO v_total_jobs
  FROM bookings
  WHERE master_id = master_id_param;

  -- Get completed jobs
  SELECT COUNT(*) INTO v_completed_jobs
  FROM bookings
  WHERE master_id = master_id_param 
    AND status = 'completed';

  -- Get average rating
  SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
  FROM reviews
  WHERE master_id = master_id_param;

  -- Get total earnings
  SELECT COALESCE(SUM(master_amount), 0) INTO v_total_earnings
  FROM payments
  WHERE master_id = master_id_param 
    AND status = 'approved';

  -- Calculate completion rate
  IF v_total_jobs > 0 THEN
    v_completion_rate := (v_completed_jobs::NUMERIC / v_total_jobs) * 100;
  ELSE
    v_completion_rate := 0;
  END IF;

  -- Calculate ranking score (weighted formula)
  -- Rating: 40%, Completion Rate: 30%, Completed Jobs: 20%, Earnings: 10%
  v_ranking_score := 
    (v_avg_rating * 20) +  -- Max 100 points from rating
    (v_completion_rate * 0.3) +  -- Max 30 points from completion
    (LEAST(v_completed_jobs, 50) * 0.4) +  -- Max 20 points from jobs
    (LEAST(v_total_earnings / 1000, 10));  -- Max 10 points from earnings

  -- Insert or update ranking
  INSERT INTO master_rankings (
    master_id, 
    ranking_score, 
    total_completed_jobs, 
    average_rating, 
    total_earnings, 
    completion_rate,
    last_updated
  )
  VALUES (
    master_id_param,
    v_ranking_score,
    v_completed_jobs,
    v_avg_rating,
    v_total_earnings,
    v_completion_rate,
    NOW()
  )
  ON CONFLICT (master_id) 
  DO UPDATE SET
    ranking_score = v_ranking_score,
    total_completed_jobs = v_completed_jobs,
    average_rating = v_avg_rating,
    total_earnings = v_total_earnings,
    completion_rate = v_completion_rate,
    last_updated = NOW();

  -- Update rank positions for all masters
  WITH ranked_masters AS (
    SELECT 
      master_id,
      ROW_NUMBER() OVER (ORDER BY ranking_score DESC) as position
    FROM master_rankings
  )
  UPDATE master_rankings mr
  SET rank_position = rm.position
  FROM ranked_masters rm
  WHERE mr.master_id = rm.master_id;
END;
$$;

-- Trigger to update ranking when review is created/updated
CREATE OR REPLACE FUNCTION public.update_ranking_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM calculate_master_ranking(NEW.master_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ranking_on_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_ranking_on_review();

-- Trigger to update ranking when booking is completed
CREATE OR REPLACE FUNCTION public.update_ranking_on_booking_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM calculate_master_ranking(NEW.master_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ranking_on_booking
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_ranking_on_booking_complete();

-- Trigger to update ranking when payment is approved
CREATE OR REPLACE FUNCTION public.update_ranking_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM calculate_master_ranking(NEW.master_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ranking_on_payment
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_ranking_on_payment();

-- Enable realtime for rankings
ALTER PUBLICATION supabase_realtime ADD TABLE public.master_rankings;