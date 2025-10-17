-- Drop the insecure update policy that allows anyone to update
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- Create secure admin-only update policy
CREATE POLICY "Only admins can update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (is_admin());

-- Tighten the insert policy to only allow clients creating payments for themselves
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;

CREATE POLICY "Clients can create own payments only"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- Block all anonymous access to payments
CREATE POLICY "Block anonymous access to payments"
ON public.payments
FOR ALL
TO anon
USING (false);