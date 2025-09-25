-- Fix security issues by setting search_path for new functions
DROP FUNCTION IF EXISTS public.calculate_selection_totals(UUID, JSONB);
DROP FUNCTION IF EXISTS public.approve_selections(TEXT, JSONB, TEXT);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_selection_totals(p_group_id UUID, p_selected_items JSONB)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_amount NUMERIC := 0;
  v_allowance_amount NUMERIC := 0;
  v_over_allowance_amount NUMERIC := 0;
  v_item JSONB;
BEGIN
  -- Get group allowance
  SELECT allowance_amount INTO v_allowance_amount
  FROM public.selection_groups 
  WHERE id = p_group_id;
  
  -- Calculate total of selected items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_selected_items)
  LOOP
    v_total_amount := v_total_amount + COALESCE((
      SELECT price FROM public.selection_items 
      WHERE id = (v_item->>'id')::UUID
    ), 0);
  END LOOP;
  
  -- Calculate over allowance
  v_over_allowance_amount := GREATEST(0, v_total_amount - v_allowance_amount);
  
  RETURN jsonb_build_object(
    'total_amount', v_total_amount,
    'allowance_amount', v_allowance_amount,
    'over_allowance_amount', v_over_allowance_amount
  );
END;
$$;

-- Recreate approve_selections function with proper search_path
CREATE OR REPLACE FUNCTION public.approve_selections(
  p_approval_token TEXT,
  p_selected_items JSONB,
  p_client_signature TEXT DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approval_id UUID;
  v_group_id UUID;
  v_order_id UUID;
  v_client_id UUID;
  v_totals JSONB;
BEGIN
  -- Validate token and get approval info
  SELECT id, group_id, order_id, client_id
  INTO v_approval_id, v_group_id, v_order_id, v_client_id
  FROM public.selection_approvals
  WHERE approval_token = p_approval_token
    AND approved_at IS NULL
    AND expires_at > now();
  
  IF v_approval_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired approval token';
  END IF;
  
  -- Calculate totals
  v_totals := public.calculate_selection_totals(v_group_id, p_selected_items);
  
  -- Update approval record
  UPDATE public.selection_approvals
  SET 
    selected_items = p_selected_items,
    total_amount = (v_totals->>'total_amount')::NUMERIC,
    allowance_amount = (v_totals->>'allowance_amount')::NUMERIC,
    over_allowance_amount = (v_totals->>'over_allowance_amount')::NUMERIC,
    approved_at = now(),
    approved_by = v_client_id,
    updated_at = now()
  WHERE id = v_approval_id;
  
  -- Log order event
  INSERT INTO public.order_events (order_id, actor_id, event_type, meta)
  VALUES (
    v_order_id, 
    v_client_id, 
    'selections_approved',
    jsonb_build_object(
      'group_id', v_group_id,
      'selected_items', p_selected_items,
      'total_amount', v_totals->>'total_amount',
      'over_allowance_amount', v_totals->>'over_allowance_amount'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', v_approval_id,
    'totals', v_totals
  );
END;
$$;