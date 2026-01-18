-- =====================================================
-- DEFINITIVE SECURITY CLEANUP: Remove all duplicate policies
-- and establish a clean, consistent security model
-- =====================================================

-- 1. CLEANUP: Remove duplicate policies on profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles with active relationship" ON public.profiles;

-- Keep only one clean SELECT policy for profiles
CREATE POLICY "Profiles access policy"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR is_admin()
    -- Allow viewing masters for search (but use view for public data)
    OR EXISTS (SELECT 1 FROM masters WHERE masters.id = profiles.id)
    -- Has active relationship
    OR EXISTS (
      SELECT 1 FROM bookings b 
      WHERE (b.master_id = profiles.id AND b.client_id = auth.uid())
         OR (b.client_id = profiles.id AND b.master_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM conversations c 
      WHERE (c.master_id = profiles.id AND c.client_id = auth.uid())
         OR (c.client_id = profiles.id AND c.master_id = auth.uid())
    )
  )
);

-- 2. CLEANUP: Remove duplicate policies on payments
DROP POLICY IF EXISTS "Authenticated users can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Clients can create own payments only" ON public.payments;
DROP POLICY IF EXISTS "Clients can create payments for their bookings" ON public.payments;
DROP POLICY IF EXISTS "Only admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;

-- Unified payments policies
CREATE POLICY "Payments SELECT policy"
ON public.payments FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    client_id = auth.uid()
    OR master_id = auth.uid()
    OR is_admin()
  )
);

CREATE POLICY "Payments INSERT policy"
ON public.payments FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND client_id = auth.uid()
);

CREATE POLICY "Payments UPDATE policy"
ON public.payments FOR UPDATE
USING (is_admin());

-- 3. CLEANUP: Remove duplicate policies on disputes
DROP POLICY IF EXISTS "Users can view own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can create disputes for their bookings" ON public.disputes;
DROP POLICY IF EXISTS "Users can update their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Admins can update disputes" ON public.disputes;
DROP POLICY IF EXISTS "Admins can delete disputes" ON public.disputes;

-- Unified disputes policies - RESTRICT to only opener + admins (not both parties)
CREATE POLICY "Disputes SELECT policy"
ON public.disputes FOR SELECT
USING (
  opened_by = auth.uid()
  OR is_admin()
  -- Only show to other party basic info, not evidence
);

CREATE POLICY "Disputes INSERT policy"
ON public.disputes FOR INSERT
WITH CHECK (
  opened_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.id = booking_id 
    AND (b.client_id = auth.uid() OR b.master_id = auth.uid())
  )
);

CREATE POLICY "Disputes UPDATE policy"
ON public.disputes FOR UPDATE
USING (opened_by = auth.uid() OR is_admin());

CREATE POLICY "Disputes DELETE policy"
ON public.disputes FOR DELETE
USING (is_admin());

-- 4. CLEANUP: Remove duplicate policies on conversations
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Clients can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;

-- Unified conversations policies
CREATE POLICY "Conversations SELECT policy"
ON public.conversations FOR SELECT
USING (
  client_id = auth.uid() 
  OR master_id = auth.uid()
  OR is_admin()
);

CREATE POLICY "Conversations INSERT policy"
ON public.conversations FOR INSERT
WITH CHECK (client_id = auth.uid() OR master_id = auth.uid());

-- 5. CLEANUP: Remove duplicate policies on messages
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;

-- Unified messages policies
CREATE POLICY "Messages SELECT policy"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.client_id = auth.uid() OR c.master_id = auth.uid())
  )
  OR is_admin()
);

CREATE POLICY "Messages INSERT policy"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.client_id = auth.uid() OR c.master_id = auth.uid())
  )
);

-- 6. CLEANUP: Remove duplicate policies on business_profiles
DROP POLICY IF EXISTS "Authenticated businesses can view own profile only" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile only" ON public.business_profiles;
DROP POLICY IF EXISTS "Authenticated businesses can insert own profile only" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Authenticated businesses can update own profile only" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;

-- Unified business_profiles policies
CREATE POLICY "Business profiles SELECT policy"
ON public.business_profiles FOR SELECT
USING (id = auth.uid() OR is_admin());

CREATE POLICY "Business profiles INSERT policy"
ON public.business_profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Business profiles UPDATE policy"
ON public.business_profiles FOR UPDATE
USING (id = auth.uid() OR is_admin());

-- 7. CLEANUP: Remove duplicate policies on commissions
DROP POLICY IF EXISTS "Masters can view own commissions" ON public.commissions;
DROP POLICY IF EXISTS "Admins can view all commissions" ON public.commissions;

-- Unified commissions policy
CREATE POLICY "Commissions SELECT policy"
ON public.commissions FOR SELECT
USING (master_id = auth.uid() OR is_admin());

-- 8. CLEANUP: Remove duplicate policies on marketplace_orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Usuarios pueden ver sus órdenes como compradores" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear órdenes" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Order participants can update orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Vendedores pueden actualizar órdenes de sus productos" ON public.marketplace_orders;

-- Unified marketplace_orders policies
CREATE POLICY "Marketplace orders SELECT policy"
ON public.marketplace_orders FOR SELECT
USING (
  buyer_id = auth.uid()
  OR seller_id = auth.uid()
  OR is_admin()
);

CREATE POLICY "Marketplace orders INSERT policy"
ON public.marketplace_orders FOR INSERT
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Marketplace orders UPDATE policy"
ON public.marketplace_orders FOR UPDATE
USING (
  buyer_id = auth.uid()
  OR seller_id = auth.uid()
  OR is_admin()
);

-- 9. CLEANUP: Remove duplicate policies on marketplace_seller_balance
DROP POLICY IF EXISTS "Sellers can view own balance" ON public.marketplace_seller_balance;
DROP POLICY IF EXISTS "Vendedores pueden ver su balance" ON public.marketplace_seller_balance;

-- Unified marketplace_seller_balance policy
CREATE POLICY "Seller balance SELECT policy"
ON public.marketplace_seller_balance FOR SELECT
USING (seller_id = auth.uid() OR is_admin());

-- 10. CLEANUP: Remove duplicate master_verification_documents policies
DROP POLICY IF EXISTS "Masters can view own verification documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can view their own verification documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Admins can update verification documents" ON public.master_verification_documents;

-- Unified verification documents policies
CREATE POLICY "Verification documents SELECT policy"
ON public.master_verification_documents FOR SELECT
USING (master_id = auth.uid() OR is_admin());

CREATE POLICY "Verification documents UPDATE by admin policy"
ON public.master_verification_documents FOR UPDATE
USING (master_id = auth.uid() OR is_admin());