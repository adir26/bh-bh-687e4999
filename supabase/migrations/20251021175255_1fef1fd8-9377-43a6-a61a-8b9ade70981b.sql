-- Remove all constraints first
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_current_status_check;
ALTER TABLE order_status_events DROP CONSTRAINT IF EXISTS order_status_events_new_status_check;
ALTER TABLE order_status_events DROP CONSTRAINT IF EXISTS order_status_events_old_status_check;

-- Update orders table
UPDATE orders SET current_status = 'cancelled' WHERE current_status = 'canceled';
UPDATE orders SET current_status = 'new' WHERE current_status = 'pending';
UPDATE orders SET current_status = 'in_progress' WHERE current_status = 'confirmed';
UPDATE orders SET current_status = 'in_progress_preparation' WHERE current_status = 'in_production';
UPDATE orders SET current_status = 'measurement' WHERE current_status = 'ready';
UPDATE orders SET current_status = 'completed' WHERE current_status = 'delivered';
UPDATE orders SET current_status = 'cancelled' WHERE current_status = 'refunded';
UPDATE orders SET current_status = 'cancelled' WHERE current_status = 'shipped';

-- Update order_status_events table - both old and new status columns
UPDATE order_status_events SET old_status = 'cancelled' WHERE old_status = 'canceled';
UPDATE order_status_events SET old_status = 'new' WHERE old_status = 'pending';
UPDATE order_status_events SET old_status = 'in_progress' WHERE old_status = 'confirmed';
UPDATE order_status_events SET old_status = 'in_progress_preparation' WHERE old_status = 'in_production';
UPDATE order_status_events SET old_status = 'measurement' WHERE old_status = 'ready';
UPDATE order_status_events SET old_status = 'completed' WHERE old_status = 'delivered';
UPDATE order_status_events SET old_status = 'cancelled' WHERE old_status = 'refunded';
UPDATE order_status_events SET old_status = 'cancelled' WHERE old_status = 'shipped';

UPDATE order_status_events SET new_status = 'cancelled' WHERE new_status = 'canceled';
UPDATE order_status_events SET new_status = 'new' WHERE new_status = 'pending';
UPDATE order_status_events SET new_status = 'in_progress' WHERE new_status = 'confirmed';
UPDATE order_status_events SET new_status = 'in_progress_preparation' WHERE new_status = 'in_production';
UPDATE order_status_events SET new_status = 'measurement' WHERE new_status = 'ready';
UPDATE order_status_events SET new_status = 'completed' WHERE new_status = 'delivered';
UPDATE order_status_events SET new_status = 'cancelled' WHERE new_status = 'refunded';
UPDATE order_status_events SET new_status = 'cancelled' WHERE new_status = 'shipped';

-- Now add constraints
ALTER TABLE orders 
  ADD CONSTRAINT orders_current_status_check 
  CHECK (current_status IN (
    'new',
    'waiting_for_scheduling',
    'measurement',
    'waiting_for_client_approval',
    'in_progress',
    'in_progress_preparation',
    'on_hold',
    'completed',
    'waiting_for_final_payment',
    'closed_paid_in_full',
    'cancelled'
  ));

ALTER TABLE order_status_events
  ADD CONSTRAINT order_status_events_new_status_check
  CHECK (new_status IN (
    'new',
    'waiting_for_scheduling',
    'measurement',
    'waiting_for_client_approval',
    'in_progress',
    'in_progress_preparation',
    'on_hold',
    'completed',
    'waiting_for_final_payment',
    'closed_paid_in_full',
    'cancelled'
  ));

ALTER TABLE order_status_events
  ADD CONSTRAINT order_status_events_old_status_check
  CHECK (old_status IN (
    'new',
    'waiting_for_scheduling',
    'measurement',
    'waiting_for_client_approval',
    'in_progress',
    'in_progress_preparation',
    'on_hold',
    'completed',
    'waiting_for_final_payment',
    'closed_paid_in_full',
    'cancelled'
  ));

-- Update the RPC function
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_reason text DEFAULT NULL,
  p_visible_to_customer boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
  v_supplier_id uuid;
  v_result jsonb;
BEGIN
  -- Get current status and verify permissions
  SELECT current_status, supplier_id INTO v_old_status, v_supplier_id
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Verify user has permission
  IF auth.uid() != v_supplier_id AND get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Validate status paul transition
  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 'New status must be different from current status';
  END IF;

  -- Update order status
  UPDATE orders
  SET 
    current_status = p_new_status,
    updated_at = now()
  WHERE id = p_order_id;

  -- Insert status event
  INSERT INTO order_status_events (
    order_id,
    old_status,
    new_status,
    reason,
    visible_to_customer,
    changed_by
  ) VALUES (
    p_order_id,
    v_old_status,
    p_new_status,
    p_reason,
    p_visible_to_customer,
    auth.uid()
  );

  v_result := jsonb_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_new_status
  );

  RETURN v_result;
END;
$$;