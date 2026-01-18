-- Add 'pending_review' status to booking_status enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'pending_review' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'pending_review';
  END IF;
END $$;

-- Create table for quotations/formal proposals
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  master_id UUID NOT NULL,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Policies for quotations
CREATE POLICY "Masters can create quotations"
ON public.quotations
FOR INSERT
WITH CHECK (auth.uid() = master_id);

CREATE POLICY "Users can view their quotations"
ON public.quotations
FOR SELECT
USING (auth.uid() = master_id OR auth.uid() = client_id);

CREATE POLICY "Masters can update their quotations"
ON public.quotations
FOR UPDATE
USING (auth.uid() = master_id OR auth.uid() = client_id);

-- Create table for quick messages templates
CREATE TABLE IF NOT EXISTS public.quick_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_messages ENABLE ROW LEVEL SECURITY;

-- Policies for quick messages
CREATE POLICY "Users can manage their quick messages"
ON public.quick_messages
FOR ALL
USING (auth.uid() = user_id);

-- Add work_started_at and work_completed_at to bookings for timeline
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS work_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMP WITH TIME ZONE;

-- Create index for quotations
CREATE INDEX IF NOT EXISTS idx_quotations_conversation ON public.quotations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_quotations_booking ON public.quotations(booking_id);