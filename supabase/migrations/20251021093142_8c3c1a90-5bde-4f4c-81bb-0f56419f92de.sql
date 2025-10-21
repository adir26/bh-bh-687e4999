-- Migration 2: Create project_participants with reinforced RLS

-- Create project participants table
CREATE TABLE IF NOT EXISTS project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','editor','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_project_participants_project ON project_participants(project_id);
CREATE INDEX idx_project_participants_user ON project_participants(user_id);
CREATE INDEX idx_project_participants_role ON project_participants(role);

-- Enable RLS
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;

-- SELECT: participants + project owners + admins can view
CREATE POLICY "project_participants_select"
ON project_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
      AND p.client_id = auth.uid()
  )
  OR get_user_role(auth.uid()) = 'admin'
);

-- INSERT: only project owners + admins can add participants
CREATE POLICY "project_participants_insert"
ON project_participants FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) = 'admin'
  OR EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
      AND p.client_id = auth.uid()
  )
);

-- UPDATE: only project owners + admins can update participants
CREATE POLICY "project_participants_update"
ON project_participants FOR UPDATE
USING (
  get_user_role(auth.uid()) = 'admin'
  OR EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
      AND p.client_id = auth.uid()
  )
);

-- DELETE: only project owners + admins can remove participants
CREATE POLICY "project_participants_delete"
ON project_participants FOR DELETE
USING (
  get_user_role(auth.uid()) = 'admin'
  OR EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id
      AND p.client_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_project_participants_updated_at
  BEFORE UPDATE ON project_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE project_participants IS 
  'Manages user access to projects with roles: owner, editor, viewer';