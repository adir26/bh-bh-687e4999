-- Update create_order_bundle RPC to accept pre-resolved IDs
-- (client creation now handled by Edge Function)

CREATE OR REPLACE FUNCTION public.create_order_bundle(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier uuid := auth.uid();
  v_lead_id uuid := (payload->>'lead_id')::uuid;
  v_client_id uuid := (payload->>'client_id')::uuid;
  v_project_id uuid;
  v_order_id uuid;
  v_total_amount numeric;
BEGIN
  -- Validate supplier
  IF v_supplier IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate required IDs
  IF v_lead_id IS NULL OR v_client_id IS NULL THEN
    RAISE EXCEPTION 'lead_id and client_id are required';
  END IF;

  -- ===== STEP 1: Resolve Project =====
  IF (payload->'project'->>'mode') = 'create' THEN
    -- Create new project
    INSERT INTO public.projects (
      client_id, created_by, title, detailed_status, address_json
    )
    VALUES (
      v_client_id, v_supplier,
      payload->'project'->'new'->>'title',
      'in_progress_preparation',
      payload->'project'->'new'->'address'
    )
    RETURNING id INTO v_project_id;

    -- Add supplier as participant
    INSERT INTO public.project_participants (project_id, user_id, role)
    VALUES (v_project_id, v_supplier, 'editor')
    ON CONFLICT DO NOTHING;

  ELSIF (payload->'project'->>'mode') = 'select' THEN
    -- Use existing project
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE id = (payload->'project'->>'project_id')::uuid
      AND client_id = v_client_id;

    IF v_project_id IS NULL THEN
      RAISE EXCEPTION 'Project not found or does not belong to client';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid project mode';
  END IF;

  -- ===== STEP 2: Create Order =====
  INSERT INTO public.orders (
    supplier_id, client_id, lead_id, project_id,
    title, description, start_date, end_date, address_json, status
  )
  VALUES (
    v_supplier, v_client_id, v_lead_id, v_project_id,
    payload->'order'->>'title',
    payload->'order'->>'description',
    (payload->'order'->>'start_date')::date,
    (payload->'order'->>'end_date')::date,
    payload->'order'->'address',
    'pending'
  )
  RETURNING id INTO v_order_id;

  -- ===== STEP 3: Create Order Items =====
  INSERT INTO public.order_items (order_id, product_id, name, description, quantity, unit_price)
  SELECT 
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'name',
    item->>'description',
    (item->>'qty')::numeric,
    (item->>'unit_price')::numeric
  FROM jsonb_array_elements(payload->'order'->'items') AS item;

  -- ===== STEP 4: Fetch Total =====
  SELECT total_amount INTO v_total_amount
  FROM public.orders
  WHERE id = v_order_id;

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'lead_id', v_lead_id,
    'project_id', v_project_id,
    'client_id', v_client_id,
    'total_amount', COALESCE(v_total_amount, 0)
  );

EXCEPTION 
  WHEN OTHERS THEN
    RAISE;
END;
$$;