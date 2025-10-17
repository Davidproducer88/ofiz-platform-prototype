-- Drop the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.service_requests;

-- Create new authenticated-only policy for viewing service requests
CREATE POLICY "Authenticated masters can view open requests, clients can view own"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
  (status = 'open' AND EXISTS (
    SELECT 1 FROM public.masters WHERE masters.id = auth.uid()
  ))
  OR client_id = auth.uid()
  OR is_admin()
);

-- Block all anonymous access to service requests
CREATE POLICY "Block anonymous access to service requests"
ON public.service_requests
FOR ALL
TO anon
USING (false);