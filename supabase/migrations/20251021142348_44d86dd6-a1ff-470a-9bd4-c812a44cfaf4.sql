-- Fix create_order_bundle: remove nonexistent project columns and create minimal project
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
  v_project_title text := COALESCE(payload->'project'->'new'->>'title', 'פרויקט חדש');
  v_project_desc text := NULL;
BEGIN
  IF v_supplier IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: No authenticated user';
  END IF;

  IF v_lead_id IS NULL OR v_client_id IS NULL THEN
    RAISE EXCEPTION 'lead_id and client_id are required';
  END IF;

  -- Build a simple description from address (optional)
  IF (payload->'project'->'new'->'address') IS NOT NULL THEN
    v_project_desc := trim(
      COALESCE(payload->'project'->'new'->'address'->>'street', '') || ' ' ||
      COALESCE(payload->'project'->'new'->'address'->>'city', '') || ' ' ||
      COALESCE(payload->'project'->'new'->'address'->>'zip', '')
    );
    IF v_project_desc = '' THEN
      v_project_desc := NULL;
    END IF;
  END IF;

  -- Resolve or create Project (without created_by/address_json)
  IF (payload->'project'->>'mode') = 'create' THEN
    INSERT INTO public.projects (
      client_id,
      title,
      detailed_status,
      description
    )
    VALUES (
      v_client_id,
      v_project_title,
      'in_progress_preparation',
      v_project_desc
    )
    RETURNING id INTO v_project_id;

    -- Add supplier as project participant
    INSERT INTO public.project_participants (project_id, user_id, role)
    VALUES (v_project_id, v_supplier, 'editor')
    ON CONFLICT (project_id, user_id) DO NOTHING;

  ELSIF (payload->'project'->>'mode') = 'select' THEN
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE id = (payload->'project'->>'project_id')::uuid
      AND client_id = v_client_id;

    IF v_project_id IS NULL THEN
      RAISE EXCEPTION 'Project not found or does not belong to client';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid project mode: must be "create" or "select"';
  END IF;

  -- Create Order with customer details
  INSERT INTO public.orders (
    supplier_id,
    client_id,
    lead_id,
    project_id,
    title,
    description,
    start_date,
    end_date,
    address_json,
    status,
    amount,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address
  )
  VALUES (
    v_supplier,
    v_client_id,
    v_lead_id,
    v_project_id,
    payload->'order'->>'title',
    payload->'order'->>'description',
    (payload->'order'->>'start_date')::date,
    (payload->'order'->>'end_date')::date,
    payload->'order'->'address',
    'pending',
    0,
    payload->'order'->>'customer_name',
    payload->'order'->>'customer_email',
    payload->'order'->>'customer_phone',
    payload->'order'->'shipping_address'
  )
  RETURNING id INTO v_order_id;

  -- Create Order Items with product_id
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    description,
    quantity,
    unit_price
  )
  SELECT
    v_order_id,
    (item->>'product_id')::uuid,
    COALESCE(item->>'product_name', item->>'name', 'פריט'),
    item->>'description',
    COALESCE((item->>'quantity')::numeric, (item->>'qty')::numeric, 1),
    COALESCE((item->>'unit_price')::numeric, 0)
  FROM jsonb_array_elements(payload->'order'->'items') AS item;

  -- Get calculated total
  SELECT total_amount INTO v_total_amount
  FROM public.orders
  WHERE id = v_order_id;

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
    RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$;