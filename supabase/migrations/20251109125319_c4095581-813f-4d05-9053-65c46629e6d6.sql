-- Add 'task' activity type to lead_activities
-- Reason: UI sends activity_type='task' for Tasks tab, but current CHECK constraint blocks it

-- 1) Drop existing CHECK constraint
ALTER TABLE public.lead_activities
  DROP CONSTRAINT IF EXISTS lead_activities_activity_type_check;

-- 2) Recreate CHECK constraint including 'task'
ALTER TABLE public.lead_activities
  ADD CONSTRAINT lead_activities_activity_type_check
  CHECK (activity_type IN (
    'call',
    'email',
    'meeting',
    'note',
    'proposal_sent',
    'follow_up',
    'status_change',
    'task'
  ));

-- No data migration needed since existing values already satisfy the old list
-- RLS and indexes remain unchanged