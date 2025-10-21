-- Drop the existing status constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_allowed;

-- Add new constraint with the additional statuses
ALTER TABLE leads ADD CONSTRAINT leads_status_allowed 
CHECK (status = ANY (ARRAY[
  'new'::text, 
  'followup'::text, 
  'no_answer'::text, 
  'no_answer_x5'::text, 
  'not_relevant'::text, 
  'error'::text, 
  'denies_contact'::text,
  'project_in_progress'::text,
  'project_completed'::text
]));