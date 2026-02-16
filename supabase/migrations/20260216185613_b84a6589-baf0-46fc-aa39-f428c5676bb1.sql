-- Clean up all related data for user 2c890a48-896f-4774-af40-43ca387c0f04
DELETE FROM public.user_roles WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.user_badges WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.user_levels WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.user_warnings WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.user_interactions WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.points_history WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.notifications WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.referral_codes WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.referral_credits WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.founder_discount_codes WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.security_audit_log WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.quick_messages WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.marketplace_favorites WHERE user_id = '2c890a48-896f-4774-af40-43ca387c0f04';
DELETE FROM public.profiles WHERE id = '2c890a48-896f-4774-af40-43ca387c0f04';