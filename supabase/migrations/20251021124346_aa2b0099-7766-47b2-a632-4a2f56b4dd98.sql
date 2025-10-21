-- Create RPC to fetch projects for supplier by client
CREATE OR REPLACE FUNCTION public.supplier_client_projects(p_client_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.title, p.created_at
  FROM projects p
  INNER JOIN project_participants pp ON pp.project_id = p.id
  WHERE p.client_id = p_client_id
    AND pp.user_id = auth.uid()
    AND pp.role = 'editor'
  ORDER BY p.created_at DESC;
$$;