-- ===========================================
-- FIX: Restringir acceso a solo usuarios autenticados
-- ===========================================

-- 1. MASTERS - Solo usuarios autenticados pueden ver
DROP POLICY IF EXISTS "Anyone can view active masters" ON public.masters;

CREATE POLICY "Authenticated users can view masters"
ON public.masters
FOR SELECT
TO authenticated
USING (true);

-- 2. MASTER_RANKINGS - Solo usuarios autenticados pueden ver
DROP POLICY IF EXISTS "Anyone can view rankings" ON public.master_rankings;

CREATE POLICY "Authenticated users can view rankings"
ON public.master_rankings
FOR SELECT
TO authenticated
USING (true);