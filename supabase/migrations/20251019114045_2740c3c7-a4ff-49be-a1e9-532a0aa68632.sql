-- Update leads table with new Hebrew status values
-- Map old statuses to new ones and add constraint

-- First, update existing records to new statuses
UPDATE public.leads 
SET status = CASE 
  WHEN status = 'new' THEN 'new'
  WHEN status = 'contacted' THEN 'followup'
  WHEN status = 'proposal_sent' THEN 'followup'
  WHEN status = 'won' THEN 'followup'
  WHEN status = 'lost' THEN 'not_relevant'
  ELSE 'new'
END;

-- Drop old constraint if exists
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add new constraint with Hebrew-friendly status values
ALTER TABLE public.leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('new', 'no_answer', 'followup', 'no_answer_x5', 'not_relevant', 'error', 'denies_contact'));