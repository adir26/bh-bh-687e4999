-- Migration 4: Secure RPC for project creation

-- RPC: Create project with participants automatically
CREATE OR REPLACE FUNCTION rpc_create_project_with_participants(
  p_title TEXT,
  p_description TEXT,
  p_client_id UUID,
  p_supplier_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_detailed project_detailed_status DEFAULT 'new',
  p_budget_min DECIMAL DEFAULT NULL,
  p_budget_max DECIMAL DEFAULT NULL,
  p_location TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_caller_role user_role;
BEGIN
  -- Permission check: only supplier/admin
  v_caller_role := get_user_role(auth.uid());
  
  IF v_caller_role NOT IN ('supplier', 'admin') THEN
    RAISE EXCEPTION 'Only suppliers and admins can create projects for clients';
  END IF;

  -- Create the project
  INSERT INTO projects (
    title, 
    description, 
    client_id, 
    category_id,
    detailed_status,
    budget_min,
    budget_max,
    location
  )
  VALUES (
    p_title, 
    p_description, 
    p_client_id, 
    p_category_id,
    p_detailed,
    p_budget_min,
    p_budget_max,
    p_location
  )
  RETURNING id INTO v_project_id;

  -- Add client as owner
  INSERT INTO project_participants (project_id, user_id, role)
  VALUES (v_project_id, p_client_id, 'owner')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- Add supplier as editor
  INSERT INTO project_participants (project_id, user_id, role)
  VALUES (v_project_id, p_supplier_id, 'editor')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- Log event (if events table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    INSERT INTO events (entity, entity_id, type, user_id, meta)
    VALUES ('project', v_project_id, 'created', auth.uid(), jsonb_build_object(
      'created_by_supplier', p_supplier_id,
      'for_client', p_client_id,
      'initial_status', p_detailed
    ));
  END IF;

  RETURN v_project_id;
END;
$$;

-- Security hardening
ALTER FUNCTION rpc_create_project_with_participants(
  TEXT, TEXT, UUID, UUID, UUID, project_detailed_status, DECIMAL, DECIMAL, TEXT
) OWNER TO postgres;

REVOKE ALL ON FUNCTION rpc_create_project_with_participants(
  TEXT, TEXT, UUID, UUID, UUID, project_detailed_status, DECIMAL, DECIMAL, TEXT
) FROM public;

REVOKE ALL ON FUNCTION rpc_create_project_with_participants(
  TEXT, TEXT, UUID, UUID, UUID, project_detailed_status, DECIMAL, DECIMAL, TEXT
) FROM anon;

GRANT EXECUTE ON FUNCTION rpc_create_project_with_participants(
  TEXT, TEXT, UUID, UUID, UUID, project_detailed_status, DECIMAL, DECIMAL, TEXT
) TO authenticated;

COMMENT ON FUNCTION rpc_create_project_with_participants IS 
  'Securely creates a project and automatically adds client as owner and supplier as editor';