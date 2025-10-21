-- Migration 3: Add project_detailed_status ENUM + column + auto-sync

-- Create ENUM with 11 detailed statuses (including cancelled)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_detailed_status') THEN
    CREATE TYPE project_detailed_status AS ENUM (
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
    );
  END IF;
END$$;

-- Add column to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS detailed_status project_detailed_status DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_projects_detailed_status
  ON projects(detailed_status);

-- Mapping function: detailed_status → status (backward compatibility)
CREATE OR REPLACE FUNCTION map_detailed_to_status(ds project_detailed_status)
RETURNS project_status AS $$
BEGIN
  IF ds IN ('new', 'waiting_for_scheduling', 'measurement', 'waiting_for_client_approval') THEN
    RETURN 'planning'::project_status;
  ELSIF ds IN ('in_progress', 'in_progress_preparation', 'on_hold', 'waiting_for_final_payment') THEN
    RETURN 'active'::project_status;
  ELSIF ds IN ('completed', 'closed_paid_in_full') THEN
    RETURN 'completed'::project_status;
  ELSIF ds = 'cancelled' THEN
    RETURN 'cancelled'::project_status;
  ELSE
    RETURN 'active'::project_status;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-sync trigger: detailed_status → status
CREATE OR REPLACE FUNCTION sync_status_from_detailed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := map_detailed_to_status(NEW.detailed_status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_sync_status ON projects;
CREATE TRIGGER trg_projects_sync_status
BEFORE INSERT OR UPDATE OF detailed_status ON projects
FOR EACH ROW
EXECUTE FUNCTION sync_status_from_detailed();

-- Safe backfill (in batches, no projects exist currently but for future)
DO $$
DECLARE
  batch_size INT := 1000;
  affected_rows INT;
BEGIN
  LOOP
    UPDATE projects
    SET detailed_status = CASE status
      WHEN 'planning'  THEN 'new'::project_detailed_status
      WHEN 'active'    THEN 'in_progress'::project_detailed_status
      WHEN 'completed' THEN 'completed'::project_detailed_status
      WHEN 'cancelled' THEN 'cancelled'::project_detailed_status
      ELSE 'new'::project_detailed_status
    END
    WHERE detailed_status IS NULL
      AND id IN (
        SELECT id FROM projects 
        WHERE detailed_status IS NULL 
        LIMIT batch_size
      );
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;
    
    RAISE NOTICE 'Updated % projects', affected_rows;
    PERFORM pg_sleep(0.1);
  END LOOP;
END$$;

COMMENT ON COLUMN projects.detailed_status IS 
  '11-stage detailed workflow status - auto-syncs to projects.status for backward compatibility';