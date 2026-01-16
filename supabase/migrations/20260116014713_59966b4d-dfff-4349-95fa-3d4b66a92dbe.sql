-- ===========================================
-- FIX: Restringir políticas con WITH CHECK (true)
-- Estas son operaciones de sistema que deben usar service_role
-- ===========================================

-- 1. message_violations - Solo sistema puede insertar
DROP POLICY IF EXISTS "System can insert violations" ON public.message_violations;
CREATE POLICY "Service role can insert violations"
ON public.message_violations
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. newsletter_subscriptions - Usuarios autenticados pueden suscribirse
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Authenticated users can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir también a anónimos suscribirse pero con validación de email
CREATE POLICY "Anyone can subscribe with valid email"
ON public.newsletter_subscriptions
FOR INSERT
TO anon
WITH CHECK (email IS NOT NULL AND email != '');

-- 3. notifications - Solo service_role puede insertar
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- También permitir que usuarios autenticados reciban notificaciones creadas para ellos
CREATE POLICY "System creates notifications for users"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. referral_credits - Solo service_role
DROP POLICY IF EXISTS "System can insert credits" ON public.referral_credits;
CREATE POLICY "Service role can insert credits"
ON public.referral_credits
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5. referrals - Solo service_role para insert y update
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can update referrals" ON public.referrals;

CREATE POLICY "Service role can insert referrals"
ON public.referrals
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update referrals"
ON public.referrals
FOR UPDATE
TO service_role
USING (true);

-- 6. security_audit_log - Solo service_role
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Service role can insert audit logs"
ON public.security_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- 7. user_roles - Solo service_role puede insertar roles
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;
CREATE POLICY "Service role can insert roles"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);