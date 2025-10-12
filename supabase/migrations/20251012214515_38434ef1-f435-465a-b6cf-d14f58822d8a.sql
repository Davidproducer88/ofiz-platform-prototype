-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'in_escrow', 'released', 'refunded');

-- Create enum for subscription plan
CREATE TYPE subscription_plan AS ENUM ('free', 'premium');

-- Table for payments/transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  master_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  master_amount NUMERIC(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  payment_method TEXT,
  escrow_released_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  monthly_applications_limit INTEGER NOT NULL DEFAULT 5,
  applications_used INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  mercadopago_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for commission tracking
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  master_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = master_id OR is_admin());

CREATE POLICY "System can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "System can update payments"
  ON public.payments FOR UPDATE
  USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Masters can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = master_id OR is_admin());

CREATE POLICY "Masters can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = master_id);

CREATE POLICY "Masters can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = master_id OR is_admin());

-- RLS Policies for commissions
CREATE POLICY "Admins can view all commissions"
  ON public.commissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Masters can view own commissions"
  ON public.commissions FOR SELECT
  USING (auth.uid() = master_id);

-- Trigger to update updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate commission and master amount
CREATE OR REPLACE FUNCTION calculate_payment_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate 5% commission
  NEW.commission_amount := ROUND(NEW.amount * 0.05, 2);
  NEW.master_amount := NEW.amount - NEW.commission_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_payment_amounts_trigger
  BEFORE INSERT OR UPDATE OF amount ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_payment_amounts();

-- Function to reset monthly applications
CREATE OR REPLACE FUNCTION reset_monthly_applications()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    applications_used = 0,
    current_period_start = now(),
    current_period_end = now() + INTERVAL '30 days'
  WHERE current_period_end < now()
    AND cancelled_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;