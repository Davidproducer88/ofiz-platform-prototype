-- Add indexes for better performance

-- Admin role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
ON user_roles(user_id, role);

-- Profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_type 
ON profiles(user_type) 
WHERE user_type IS NOT NULL;

-- Conversations lookup
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(client_id, master_id);

CREATE INDEX IF NOT EXISTS idx_conversations_master_id 
ON conversations(master_id);

-- Messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read, created_at DESC);

-- Bookings by status
CREATE INDEX IF NOT EXISTS idx_bookings_status_date 
ON bookings(status, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_bookings_master_status 
ON bookings(master_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_client_status 
ON bookings(client_id, status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status) 
WHERE status IN ('pending', 'approved');

-- Marketplace orders
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer 
ON marketplace_orders(buyer_id, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller 
ON marketplace_orders(seller_id, status);

-- Email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_user 
ON security_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_event 
ON security_audit_log(event_type, created_at DESC);

-- Enable RLS on security audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security audit log"
ON security_audit_log
FOR SELECT
USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON security_audit_log
FOR INSERT
WITH CHECK (true);

COMMENT ON TABLE security_audit_log IS 'Security audit log for tracking important events';
COMMENT ON COLUMN security_audit_log.event_type IS 'Type of security event (login_attempt, failed_login, password_change, etc.)';
COMMENT ON COLUMN security_audit_log.metadata IS 'Additional event data in JSON format';