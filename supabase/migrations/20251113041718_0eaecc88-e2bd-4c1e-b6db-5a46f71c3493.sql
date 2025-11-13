-- Add payment flexibility columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_percentage INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS remaining_payment_id UUID REFERENCES public.payments(id),
ADD COLUMN IF NOT EXISTS incentive_discount NUMERIC DEFAULT 0;

-- Add comment to explain the flow
COMMENT ON COLUMN public.payments.payment_percentage IS 'Percentage paid: 50 or 100. 50% requires second payment after completion';
COMMENT ON COLUMN public.payments.remaining_amount IS 'Remaining amount if payment_percentage is 50%';
COMMENT ON COLUMN public.payments.installments IS 'Number of installments for MercadoPago financing';
COMMENT ON COLUMN public.payments.incentive_discount IS 'Discount applied for paying 100% upfront';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payments_remaining_payment ON public.payments(remaining_payment_id) WHERE remaining_payment_id IS NOT NULL;