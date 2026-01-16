-- Add mercadopago_payment_id column to subscriptions table for storing individual payment IDs
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS mercadopago_payment_id text;

-- Add status column if it doesn't exist (the code expects 'active', 'pending', etc.)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_mercadopago_payment_id 
ON public.subscriptions(mercadopago_payment_id) 
WHERE mercadopago_payment_id IS NOT NULL;