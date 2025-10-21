-- Remove order status transition validation to allow free status selection
-- This allows suppliers to update orders to any status without restrictions

CREATE OR REPLACE FUNCTION public.rpc_update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_is_customer_visible BOOLEAN DEFAULT false,
  p_changed_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(success BOOLEAN, message TEXT, updated_order public.orders)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_updated public.orders;
BEGIN
  -- Check permissions
  IF NOT public.rpc_supplier_can_access(p_order_id) THEN
    RETURN QUERY SELECT false, 'אין הרשאה לעדכן הזמנה זו'::TEXT, NULL::public.orders;
    RETURN;
  END IF;

  -- Get current status
  SELECT current_status INTO v_current_status FROM public.orders WHERE id = p_order_id;
  IF v_current_status IS NULL THEN
    SELECT CASE status::text
      WHEN 'in_progress' THEN 'in_production'
      WHEN 'completed' THEN 'delivered'
      WHEN 'cancelled' THEN 'canceled'
      ELSE status::text
    END INTO v_current_status
    FROM public.orders WHERE id = p_order_id;
  END IF;

  -- *** REMOVED STATUS VALIDATION - Allow any status transition ***
  -- Suppliers can now freely update to any status

  -- Update order status
  UPDATE public.orders SET
    current_status = p_new_status,
    closed_at = CASE 
      WHEN p_new_status IN ('delivered','canceled','refunded','closed_paid_in_full','cancelled') 
      THEN now() 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_updated;

  -- Log the status change
  INSERT INTO public.order_status_events(
    order_id, 
    old_status, 
    new_status, 
    reason, 
    is_customer_visible, 
    changed_by
  )
  VALUES (
    p_order_id, 
    v_current_status, 
    p_new_status, 
    p_reason, 
    p_is_customer_visible, 
    p_changed_by
  );

  RETURN QUERY SELECT true, 'סטטוס עודכן בהצלחה'::TEXT, v_updated;
END;
$$;