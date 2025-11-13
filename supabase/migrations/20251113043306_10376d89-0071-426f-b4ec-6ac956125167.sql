-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  opened_by UUID NOT NULL,
  opened_by_role TEXT NOT NULL CHECK (opened_by_role IN ('client', 'master')),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolution_type TEXT CHECK (resolution_type IN ('refund_full', 'refund_partial', 'release_full', 'release_partial', 'other')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_disputes_booking_id ON public.disputes(booking_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_opened_by ON public.disputes(opened_by);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own disputes
CREATE POLICY "Users can view own disputes"
ON public.disputes
FOR SELECT
USING (
  opened_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = disputes.booking_id
    AND (bookings.client_id = auth.uid() OR bookings.master_id = auth.uid())
  ) OR
  public.is_admin()
);

-- Policy: Users can create disputes for their bookings
CREATE POLICY "Users can create disputes"
ON public.disputes
FOR INSERT
WITH CHECK (
  opened_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = disputes.booking_id
    AND (bookings.client_id = auth.uid() OR bookings.master_id = auth.uid())
    AND bookings.status IN ('completed', 'in_progress')
  )
);

-- Policy: Only admins can update disputes
CREATE POLICY "Admins can update disputes"
ON public.disputes
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy: Only admins can delete disputes
CREATE POLICY "Admins can delete disputes"
ON public.disputes
FOR DELETE
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to notify on dispute creation
CREATE OR REPLACE FUNCTION public.notify_dispute_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_data RECORD;
  other_user_id UUID;
BEGIN
  -- Get booking data
  SELECT client_id, master_id INTO booking_data
  FROM public.bookings
  WHERE id = NEW.booking_id;

  -- Determine other party
  IF NEW.opened_by = booking_data.client_id THEN
    other_user_id := booking_data.master_id;
  ELSE
    other_user_id := booking_data.client_id;
  END IF;

  -- Notify other party
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    other_user_id,
    'dispute_opened',
    '⚠️ Disputa Abierta',
    'Se ha abierto una disputa sobre una reserva. Un administrador la revisará pronto.',
    jsonb_build_object(
      'dispute_id', NEW.id,
      'booking_id', NEW.booking_id
    )
  );

  -- Notify admins (get all admin users)
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  SELECT 
    ur.user_id,
    'dispute_new_admin',
    '🚨 Nueva Disputa',
    'Se ha abierto una nueva disputa que requiere revisión',
    jsonb_build_object(
      'dispute_id', NEW.id,
      'booking_id', NEW.booking_id,
      'opened_by_role', NEW.opened_by_role
    )
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$$;

-- Create trigger for dispute creation
CREATE TRIGGER on_dispute_created
AFTER INSERT ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.notify_dispute_created();

-- Add comments
COMMENT ON TABLE public.disputes IS 'Disputes opened by clients or masters when there is disagreement about service completion or payment';
COMMENT ON COLUMN public.disputes.opened_by_role IS 'Role of user who opened dispute: client or master';
COMMENT ON COLUMN public.disputes.status IS 'Status: open, under_review, resolved, closed';
COMMENT ON COLUMN public.disputes.resolution_type IS 'Type of resolution: refund_full, refund_partial, release_full, release_partial, other';