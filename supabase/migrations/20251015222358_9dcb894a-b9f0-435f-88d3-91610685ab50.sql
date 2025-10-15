-- Ajustar política de feed_posts para permitir inserción más flexible
DROP POLICY IF EXISTS "Masters can create own posts" ON public.feed_posts;

CREATE POLICY "Masters can create own posts"
ON public.feed_posts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.masters
    WHERE masters.id = feed_posts.master_id
  )
);

-- Ajustar política de sponsored_content para permitir inserción por masters
DROP POLICY IF EXISTS "Admins can manage sponsored content" ON public.sponsored_content;

CREATE POLICY "Admins can manage sponsored content"
ON public.sponsored_content
FOR ALL
USING (is_admin());

CREATE POLICY "Masters can create sponsored content"
ON public.sponsored_content
FOR INSERT
TO authenticated
WITH CHECK (
  master_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.masters
    WHERE masters.id = sponsored_content.master_id
  )
);