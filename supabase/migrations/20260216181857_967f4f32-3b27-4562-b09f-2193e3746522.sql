
-- REINSTALL ALL MISSING TRIGGERS

-- Messages
DROP TRIGGER IF EXISTS update_conversation_timestamp ON public.messages;
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

DROP TRIGGER IF EXISTS create_message_notification_trigger ON public.messages;
CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.create_message_notification();

-- Bookings
DROP TRIGGER IF EXISTS booking_status_notification ON public.bookings;
CREATE TRIGGER booking_status_notification
  AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.create_booking_status_notification();

DROP TRIGGER IF EXISTS update_ranking_on_booking_trigger ON public.bookings;
CREATE TRIGGER update_ranking_on_booking_trigger
  AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_ranking_on_booking_complete();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles
DROP TRIGGER IF EXISTS handle_master_creation_trigger ON public.profiles;
CREATE TRIGGER handle_master_creation_trigger
  AFTER INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_master_creation();

DROP TRIGGER IF EXISTS handle_user_role_assignment_trigger ON public.profiles;
CREATE TRIGGER handle_user_role_assignment_trigger
  AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_user_role_assignment();

DROP TRIGGER IF EXISTS create_referral_code_trigger ON public.profiles;
CREATE TRIGGER create_referral_code_trigger
  AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_referral_code_for_user();

DROP TRIGGER IF EXISTS check_founder_badge_trigger ON public.profiles;
CREATE TRIGGER check_founder_badge_trigger
  AFTER INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.check_founder_badge();

DROP TRIGGER IF EXISTS create_founder_discount_code_trigger ON public.profiles;
CREATE TRIGGER create_founder_discount_code_trigger
  AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_founder_discount_code();

DROP TRIGGER IF EXISTS check_founder_slots_trigger ON public.profiles;
CREATE TRIGGER check_founder_slots_trigger
  AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.check_founder_slots_and_notify();

DROP TRIGGER IF EXISTS notify_new_founder_trigger ON public.profiles;
CREATE TRIGGER notify_new_founder_trigger
  AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.notify_new_founder();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reviews
DROP TRIGGER IF EXISTS update_master_rating_trigger ON public.reviews;
CREATE TRIGGER update_master_rating_trigger
  AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_master_rating();

DROP TRIGGER IF EXISTS update_ranking_on_review_trigger ON public.reviews;
CREATE TRIGGER update_ranking_on_review_trigger
  AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_ranking_on_review();

-- Payments
DROP TRIGGER IF EXISTS update_ranking_on_payment_trigger ON public.payments;
CREATE TRIGGER update_ranking_on_payment_trigger
  AFTER UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_ranking_on_payment();

DROP TRIGGER IF EXISTS calculate_payment_commission_trigger ON public.payments;
CREATE TRIGGER calculate_payment_commission_trigger
  BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.calculate_payment_commission();

-- Disputes
DROP TRIGGER IF EXISTS notify_dispute_created_trigger ON public.disputes;
CREATE TRIGGER notify_dispute_created_trigger
  AFTER INSERT ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.notify_dispute_created();

DROP TRIGGER IF EXISTS update_disputes_updated_at ON public.disputes;
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marketplace
DROP TRIGGER IF EXISTS calculate_marketplace_order_trigger ON public.marketplace_orders;
CREATE TRIGGER calculate_marketplace_order_trigger
  BEFORE INSERT ON public.marketplace_orders FOR EACH ROW EXECUTE FUNCTION public.calculate_marketplace_order_amounts();

DROP TRIGGER IF EXISTS validate_marketplace_order_trigger ON public.marketplace_orders;
CREATE TRIGGER validate_marketplace_order_trigger
  BEFORE INSERT ON public.marketplace_orders FOR EACH ROW EXECUTE FUNCTION public.validate_marketplace_order();

DROP TRIGGER IF EXISTS update_marketplace_orders_updated_at ON public.marketplace_orders;
CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON public.marketplace_orders FOR EACH ROW EXECUTE FUNCTION public.update_marketplace_timestamp();

DROP TRIGGER IF EXISTS update_product_rating_trigger ON public.marketplace_reviews;
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON public.marketplace_products;
CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON public.marketplace_products FOR EACH ROW EXECUTE FUNCTION public.update_marketplace_timestamp();

-- Masters
DROP TRIGGER IF EXISTS update_masters_updated_at ON public.masters;
CREATE TRIGGER update_masters_updated_at
  BEFORE UPDATE ON public.masters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Other tables
DROP TRIGGER IF EXISTS update_advertisements_updated_at ON public.advertisements;
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_subscriptions_updated_at ON public.business_subscriptions;
CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON public.business_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_engagement_trigger ON public.user_interactions;
CREATE TRIGGER update_post_engagement_trigger
  AFTER INSERT ON public.user_interactions FOR EACH ROW EXECUTE FUNCTION public.update_post_engagement();

DROP TRIGGER IF EXISTS update_client_address_timestamp ON public.client_addresses;
CREATE TRIGGER update_client_address_timestamp
  BEFORE UPDATE ON public.client_addresses FOR EACH ROW EXECUTE FUNCTION public.update_client_address_updated_at();

DROP TRIGGER IF EXISTS update_user_warnings_timestamp ON public.user_warnings;
CREATE TRIGGER update_user_warnings_timestamp
  BEFORE UPDATE ON public.user_warnings FOR EACH ROW EXECUTE FUNCTION public.update_user_warnings_updated_at();

-- Service applications (correct table name)
DROP TRIGGER IF EXISTS notify_application_received_trigger ON public.service_applications;
CREATE TRIGGER notify_application_received_trigger
  AFTER INSERT ON public.service_applications FOR EACH ROW EXECUTE FUNCTION public.notify_application_received();

DROP TRIGGER IF EXISTS create_conversation_on_accept_trigger ON public.service_applications;
CREATE TRIGGER create_conversation_on_accept_trigger
  AFTER UPDATE ON public.service_applications FOR EACH ROW EXECUTE FUNCTION public.create_conversation_on_accept();

-- FIX PERMISSIVE RLS POLICIES
DROP POLICY IF EXISTS "Service role can insert violations" ON public.message_violations;
CREATE POLICY "Authenticated can insert violations"
  ON public.message_violations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can insert credits" ON public.referral_credits;
CREATE POLICY "Authenticated can insert credits"
  ON public.referral_credits FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can insert referrals" ON public.referrals;
CREATE POLICY "Authenticated can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can update referrals" ON public.referrals;
CREATE POLICY "Authenticated can update referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Authenticated can insert audit logs"
  ON public.security_audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service role can insert roles" ON public.user_roles;
CREATE POLICY "Authenticated can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "System can update warnings" ON public.user_warnings;
CREATE POLICY "Admins can manage warnings"
  ON public.user_warnings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
