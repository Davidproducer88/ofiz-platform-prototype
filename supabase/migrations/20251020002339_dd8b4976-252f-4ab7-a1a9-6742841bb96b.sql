-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON public.newsletter_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view own subscription
CREATE POLICY "Users can view own newsletter subscription"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Policy: Users can update own subscription (unsubscribe)
CREATE POLICY "Users can update own newsletter subscription"
  ON public.newsletter_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Policy: Admins can view all
CREATE POLICY "Admins can view all newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (is_admin());

-- Function to get platform stats
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_masters', (SELECT COUNT(*) FROM masters),
    'total_clients', (SELECT COUNT(*) FROM profiles WHERE user_type = 'client'),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'completed'),
    'average_rating', (SELECT COALESCE(AVG(rating), 0) FROM masters),
    'total_reviews', (SELECT COUNT(*) FROM reviews),
    'satisfaction_rate', (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE rating >= 4)::NUMERIC / COUNT(*)) * 100, 1)
        ELSE 0
      END
      FROM reviews
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;