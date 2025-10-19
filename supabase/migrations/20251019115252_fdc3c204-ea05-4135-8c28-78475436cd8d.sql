-- Fix lead status validation: remove legacy triggers/constraints and allow new statuses
BEGIN;

-- 1) Map legacy statuses to the new set to avoid violating the new CHECK
UPDATE public.leads SET status = 'followup' 
WHERE status IN ('contacted','proposal_sent');

UPDATE public.leads SET status = 'not_relevant'
WHERE status IN ('lost','invalid','spam');

-- 2) Drop any triggers on "leads" that enforce/transform status values
DO $$
DECLARE tr record;
BEGIN
  FOR tr IN
    SELECT tg.tgname
    FROM pg_trigger tg
    JOIN pg_class tbl ON tg.tgrelid = tbl.oid
    JOIN pg_proc p   ON tg.tgfoid = p.oid
    WHERE tbl.relname = 'leads'
      AND NOT tg.tgisinternal
      AND (
        p.proname ILIKE '%status%'
        OR tg.tgname ILIKE '%status%'
        OR tg.tgname ILIKE '%sync_lead_status%'
        OR p.proname ILIKE '%sync_lead_status%'
        OR p.proname ILIKE '%validate_lead_status%'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.leads', tr.tgname);
  END LOOP;
END $$;

-- 3) Drop legacy helper functions if they exist (idempotent)
DROP FUNCTION IF EXISTS public.tg_sync_lead_status() CASCADE;
DROP FUNCTION IF EXISTS public.tg_sync_lead_source() CASCADE;
DROP FUNCTION IF EXISTS public.tg_sync_lead_priority() CASCADE;
DROP FUNCTION IF EXISTS public.tg_validate_lead_status() CASCADE;
DROP FUNCTION IF EXISTS public.validate_lead_status() CASCADE;

-- 4) Drop any existing CHECK constraints on status
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.leads'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 5) Add a single canonical CHECK constraint for allowed statuses
ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_allowed
  CHECK (status IN (
    'new',
    'followup',
    'no_answer',
    'no_answer_x5',
    'not_relevant',
    'error',
    'denies_contact'
  ));

-- Ensure default remains valid
ALTER TABLE public.leads
  ALTER COLUMN status SET DEFAULT 'new';

COMMIT;