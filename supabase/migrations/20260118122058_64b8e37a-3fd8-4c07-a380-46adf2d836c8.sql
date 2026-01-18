-- =====================================================
-- SECURITY FIX: Comprehensive RLS Policy Update
-- Using has_role() function for admin checks
-- =====================================================

-- 1. FIX: disputes table - Only participants and admins can access
DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON public.disputes;
DROP POLICY IF EXISTS "Users can create disputes for their bookings" ON public.disputes;
DROP POLICY IF EXISTS "Block anonymous access to disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can update their own disputes" ON public.disputes;

CREATE POLICY "Users can view their own disputes"
ON public.disputes FOR SELECT
USING (
  opened_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.id = disputes.booking_id 
    AND (b.client_id = auth.uid() OR b.master_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create disputes for their bookings"
ON public.disputes FOR INSERT
WITH CHECK (
  opened_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.id = booking_id 
    AND (b.client_id = auth.uid() OR b.master_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own disputes"
ON public.disputes FOR UPDATE
USING (
  opened_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 2. FIX: payments table - Only transaction participants and admins
DROP POLICY IF EXISTS "Block anonymous access to payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Clients can create payments for their bookings" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;

CREATE POLICY "Authenticated users can view their payments"
ON public.payments FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    client_id = auth.uid()
    OR master_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Clients can create payments for their bookings"
ON public.payments FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND client_id = auth.uid()
);

CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 3. FIX: client_addresses - Only owner can access
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.client_addresses;

CREATE POLICY "Users can view own addresses"
ON public.client_addresses FOR SELECT
USING (client_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
ON public.client_addresses FOR INSERT
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own addresses"
ON public.client_addresses FOR UPDATE
USING (client_id = auth.uid());

CREATE POLICY "Users can delete own addresses"
ON public.client_addresses FOR DELETE
USING (client_id = auth.uid());

-- 4. FIX: master_verification_documents - Only master and admins
DROP POLICY IF EXISTS "Masters can view their own documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can upload their documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can view own verification documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can upload verification documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can update own documents" ON public.master_verification_documents;
DROP POLICY IF EXISTS "Masters can delete own documents" ON public.master_verification_documents;

CREATE POLICY "Masters can view own verification documents"
ON public.master_verification_documents FOR SELECT
USING (
  master_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Masters can upload verification documents"
ON public.master_verification_documents FOR INSERT
WITH CHECK (master_id = auth.uid());

CREATE POLICY "Masters can update own documents"
ON public.master_verification_documents FOR UPDATE
USING (master_id = auth.uid());

CREATE POLICY "Masters can delete own documents"
ON public.master_verification_documents FOR DELETE
USING (master_id = auth.uid());

-- 5. FIX: profiles table - Proper access control
DROP POLICY IF EXISTS "Block all public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Allow authenticated users to view public info of masters/businesses, own profile, and admins see all
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR public.has_role(id, 'master')
    OR public.has_role(id, 'business')
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- 6. FIX: business_profiles - Only owner and admins
DROP POLICY IF EXISTS "Block anonymous access to business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business profiles viewable by everyone" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;

CREATE POLICY "Business owners can view own profile"
ON public.business_profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Business owners can update own profile"
ON public.business_profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Business owners can insert own profile"
ON public.business_profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- 7. FIX: commissions - Only master and admins
DROP POLICY IF EXISTS "Masters can view their commissions" ON public.commissions;
DROP POLICY IF EXISTS "Masters can view own commissions" ON public.commissions;

CREATE POLICY "Masters can view own commissions"
ON public.commissions FOR SELECT
USING (
  master_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 8. FIX: marketplace_seller_balance - Only seller and admins
DROP POLICY IF EXISTS "Sellers can view their balance" ON public.marketplace_seller_balance;
DROP POLICY IF EXISTS "Sellers can view own balance" ON public.marketplace_seller_balance;

CREATE POLICY "Sellers can view own balance"
ON public.marketplace_seller_balance FOR SELECT
USING (
  seller_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 9. FIX: marketplace_orders - Only buyer, seller, and admins
DROP POLICY IF EXISTS "Users can view their orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Order participants can update orders" ON public.marketplace_orders;

CREATE POLICY "Users can view own orders"
ON public.marketplace_orders FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Buyers can create orders"
ON public.marketplace_orders FOR INSERT
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Order participants can update orders"
ON public.marketplace_orders FOR UPDATE
USING (
  buyer_id = auth.uid()
  OR seller_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- 10. FIX: messages - Only conversation participants
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;

CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.client_id = auth.uid() OR c.master_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can send messages in own conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.client_id = auth.uid() OR c.master_id = auth.uid())
  )
);

-- 11. FIX: conversations - Only participants
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Clients can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (
  client_id = auth.uid() 
  OR master_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clients can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Participants can update conversations"
ON public.conversations FOR UPDATE
USING (
  client_id = auth.uid() 
  OR master_id = auth.uid()
);