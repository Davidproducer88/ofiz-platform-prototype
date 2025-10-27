-- Drop existing constraint if exists
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint with all notification types including marketplace
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_request',
  'booking_confirmed',
  'booking_accepted', 
  'booking_cancelled',
  'booking_completed',
  'booking_updated',
  'booking_new',
  'new_review',
  'new_message',
  'message_new',
  'payment_received',
  'subscription_expiring',
  'subscription_renewed',
  'marketplace_order_confirmed',
  'marketplace_new_sale',
  'marketplace_order_shipped',
  'marketplace_order_delivered'
));

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role can insert transactions" ON marketplace_transactions;
DROP POLICY IF EXISTS "Service role can insert seller balance" ON marketplace_seller_balance;
DROP POLICY IF EXISTS "Service role can update seller balance" ON marketplace_seller_balance;
DROP POLICY IF EXISTS "Vendedores pueden actualizar su balance" ON marketplace_seller_balance;

-- Add RLS policies for marketplace_transactions
-- Allow authenticated users to insert when they are part of the order
CREATE POLICY "Users can insert transactions for their orders"
ON marketplace_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_orders
    WHERE marketplace_orders.id = order_id
    AND (marketplace_orders.buyer_id = auth.uid() OR marketplace_orders.seller_id = auth.uid())
  )
);

-- Add RLS policies for marketplace_seller_balance
-- Allow sellers to insert their own balance
CREATE POLICY "Sellers can insert their balance"
ON marketplace_seller_balance
FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

-- Allow sellers to update their own balance
CREATE POLICY "Sellers can update their balance"
ON marketplace_seller_balance
FOR UPDATE
TO authenticated
USING (seller_id = auth.uid());