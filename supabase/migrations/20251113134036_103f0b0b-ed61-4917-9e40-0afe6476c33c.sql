-- Mejorar políticas RLS de client_addresses para mayor granularidad
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.client_addresses;

CREATE POLICY "Users can view own addresses"
ON public.client_addresses
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own addresses"
ON public.client_addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own addresses"
ON public.client_addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Users can delete own addresses"
ON public.client_addresses
FOR DELETE
TO authenticated
USING (auth.uid() = client_id);

-- Mejorar políticas de marketplace_categories
CREATE POLICY "Admins can insert categories"
ON public.marketplace_categories
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
ON public.marketplace_categories
FOR UPDATE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete categories"
ON public.marketplace_categories
FOR DELETE
TO authenticated
USING (is_admin());