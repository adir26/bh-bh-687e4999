-- Fix leads statuses - canonical list
BEGIN;

-- Drop old constraint if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_status_allowed' 
    AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads DROP CONSTRAINT leads_status_allowed;
  END IF;
END $$;

-- Backfill old values to canonical statuses
UPDATE public.leads 
SET status = 'project_in_process' 
WHERE status = 'project_in_progress';

UPDATE public.leads 
SET status = 'new' 
WHERE status IN ('contacted', 'qualified', 'proposal_sent', 'won', 'lost');

-- Add canonical CHECK constraint
ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_allowed CHECK (status IN (
    'new',
    'followup',
    'no_answer',
    'no_answer_x5',
    'not_relevant',
    'error',
    'denies_contact',
    'project_in_process'
  ));

COMMIT;