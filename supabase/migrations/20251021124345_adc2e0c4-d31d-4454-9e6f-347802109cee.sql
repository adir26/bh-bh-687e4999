-- Create atomic RPC for order bundle creation
CREATE OR REPLACE FUNCTION public.create_order_bundle(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier uuid := auth.uid();
  v_lead_id uuid;
  v_client_id uuid;
  v_project_id uuid;
  v_order_id uuid;
  v_total_amount numeric;
BEGIN
  -- Validate supplier authentication
  IF v_supplier IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be authenticated';
  END IF;

  -- ===== STEP 1: Resolve or Create Lead =====
  IF (payload->'lead'->>'mode') = 'create' THEN
    -- Create new client profile
    INSERT INTO public.profiles (full_name, email, phone, role)
    VALUES (
      payload->'lead'->'new'->>'full_name',
      LOWER(payload->'lead'->'new'->>'email'),
      payload->'lead'->'new'->>'phone',
      'client'
    )
    RETURNING id INTO v_client_id;

    -- Create new lead with status = 'project_in_process'
    INSERT INTO public.leads (
      supplier_id, client_id, name, contact_email, contact_phone,
      status, source_key, priority_key, notes
    )
    VALUES (
      v_supplier, v_client_id,
      payload->'lead'->'new'->>'full_name',
      LOWER(payload->'lead'->'new'->>'email'),
      payload->'lead'->'new'->>'phone',
      'project_in_process',
      'orders',
      'medium',
      'Auto-created from order bundle'
    )
    RETURNING id INTO v_lead_id;

  ELSIF (payload->'lead'->>'mode') = 'select' THEN
    -- Use existing lead
    SELECT id, client_id INTO v_lead_id, v_client_id
    FROM public.leads
    WHERE id = (payload->'lead'->>'lead_id')::uuid
      AND supplier_id = v_supplier;

    IF v_lead_id IS NULL THEN
      RAISE EXCEPTION 'Lead not found or access denied';
    END IF;

    IF v_client_id IS NULL THEN
      RAISE EXCEPTION 'Selected lead has no linked client';
    END IF;

    -- Update lead status to 'project_in_process'
    UPDATE public.leads
    SET status = 'project_in_process', updated_at = now()
    WHERE id = v_lead_id;
  ELSE
    RAISE EXCEPTION 'Invalid lead mode. Must be "create" or "select"';
  END IF;

  -- ===== STEP 2: Resolve or Create Project =====
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

    -- Add supplier as project participant
    INSERT INTO public.project_participants (project_id, user_id, role)
    VALUES (v_project_id, v_supplier, 'editor')
    ON CONFLICT (project_id, user_id) DO NOTHING;

  ELSIF (payload->'project'->>'mode') = 'select' THEN
    -- Use existing project
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE id = (payload->'project'->>'project_id')::uuid
      AND client_id = v_client_id;

    IF v_project_id IS NULL THEN
      RAISE EXCEPTION 'Project not found or does not belong to this client';
    END IF;

    -- Ensure supplier is a participant
    INSERT INTO public.project_participants (project_id, user_id, role)
    VALUES (v_project_id, v_supplier, 'editor')
    ON CONFLICT (project_id, user_id) DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Invalid project mode. Must be "create" or "select"';
  END IF;

  -- ===== STEP 3: Create Order =====
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

  -- ===== STEP 4: Create Order Items =====
  INSERT INTO public.order_items (order_id, product_id, name, description, quantity, unit_price)
  SELECT 
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'name',
    item->>'description',
    (item->>'qty')::numeric,
    (item->>'unit_price')::numeric
  FROM jsonb_array_elements(payload->'order'->'items') AS item;

  -- ===== STEP 5: Fetch computed total =====
  SELECT total_amount INTO v_total_amount
  FROM public.orders
  WHERE id = v_order_id;

  -- Return success response
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