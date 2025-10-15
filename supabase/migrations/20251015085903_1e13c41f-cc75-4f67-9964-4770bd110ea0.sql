-- Migration: Add lead_priority_dim table and migrate from CHECK constraint to FK

-- Step 1: Create dimension table for priorities
CREATE TABLE IF NOT EXISTS public.lead_priority_dim (
  key text PRIMARY KEY,
  label text NOT NULL UNIQUE,
  rank smallint NOT NULL CHECK (rank > 0),
  active boolean NOT NULL DEFAULT true
);

-- Step 2: Insert initial values
INSERT INTO public.lead_priority_dim (key, label, rank) VALUES
  ('low', 'Low', 1),
  ('medium', 'Medium', 2),
  ('high', 'High', 3)
ON CONFLICT (key) DO NOTHING;

-- Step 3: Add new column to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS priority_key text;

-- Step 4: Migrate data from old column to new column
UPDATE public.leads l
SET priority_key = CASE lower(l.priority)
  WHEN 'low'    THEN 'low'
  WHEN 'medium' THEN 'medium'
  WHEN 'high'   THEN 'high'
  WHEN 'vip'    THEN 'vip'
  ELSE 'medium'
END
WHERE l.priority_key IS NULL;

-- Step 5: Add VIP value to dictionary
INSERT INTO public.lead_priority_dim (key, label, rank)
VALUES ('vip', 'VIP', 4)
ON CONFLICT (key) DO NOTHING;

-- Step 6: Set Foreign Key + NOT NULL + default
ALTER TABLE public.leads
  ADD CONSTRAINT leads_priority_fk
  FOREIGN KEY (priority_key)
  REFERENCES public.lead_priority_dim(key);

ALTER TABLE public.leads
  ALTER COLUMN priority_key SET NOT NULL,
  ALTER COLUMN priority_key SET DEFAULT 'medium';

-- Step 7: Drop old CHECK constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_priority_check;

-- Step 8: Create index for sorting by rank
CREATE INDEX IF NOT EXISTS idx_priority_rank
ON public.lead_priority_dim (rank);