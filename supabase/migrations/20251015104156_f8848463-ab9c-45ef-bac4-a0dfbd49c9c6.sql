-- ============================================
-- Migration: Fix leads_priority_check error & migrate to priority_key/source_key
-- ============================================

-- Step 1: Create lead_priority_dim if not exists
CREATE TABLE IF NOT EXISTS public.lead_priority_dim (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  rank SMALLINT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Populate priority dimension
INSERT INTO public.lead_priority_dim (key, label, rank, active)
VALUES 
  ('low', 'נמוכה', 1, TRUE),
  ('medium', 'בינונית', 2, TRUE),
  ('high', 'גבוהה', 3, TRUE),
  ('vip', 'VIP', 4, TRUE)
ON CONFLICT (key) DO NOTHING;

-- Step 2: Create lead_source_dim
CREATE TABLE IF NOT EXISTS public.lead_source_dim (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL DEFAULT 'organic'
);

-- Populate source dimension
INSERT INTO public.lead_source_dim (key, label, channel)
VALUES 
  ('website', 'אתר', 'organic'),
  ('referral', 'הפניה', 'organic'),
  ('social_media', 'רשתות חברתיות', 'organic'),
  ('advertising', 'פרסום', 'paid'),
  ('direct', 'ישיר', 'direct'),
  ('other', 'אחר', 'organic'),
  ('facebook_paid', 'פייסבוק ממומן', 'paid'),
  ('facebook_organic', 'פייסבוק אורגני', 'organic'),
  ('word_of_mouth', 'פה לאוזן', 'organic'),
  ('whatsapp', 'וואטסאפ', 'organic')
ON CONFLICT (key) DO NOTHING;

-- Step 3: Add new columns to leads table if not exists
DO $$ 
BEGIN
  -- Add priority_key column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'priority_key'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN priority_key TEXT DEFAULT 'medium';
  END IF;

  -- Add source_key column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leads' 
    AND column_name = 'source_key'
  ) THEN
    ALTER TABLE public.leads 
    ADD COLUMN source_key TEXT DEFAULT 'other';
  END IF;
END $$;

-- Step 4: Backfill data from old columns to new columns
UPDATE public.leads 
SET priority_key = CASE 
  WHEN LOWER(priority) IN ('low', 'medium', 'high', 'vip') THEN LOWER(priority)
  ELSE 'medium'
END
WHERE priority_key IS NULL OR priority_key = 'medium';

UPDATE public.leads 
SET source_key = CASE 
  WHEN source IN ('website', 'referral', 'social_media', 'advertising', 'direct', 'other') THEN source
  WHEN source = 'facebook_paid' THEN 'facebook_paid'
  WHEN source = 'facebook_organic' THEN 'facebook_organic'
  WHEN source = 'whatsapp' THEN 'whatsapp'
  WHEN source = 'word_of_mouth' THEN 'word_of_mouth'
  ELSE 'other'
END
WHERE source_key IS NULL OR source_key = 'other';

-- Step 5: Make columns NOT NULL and add foreign keys
ALTER TABLE public.leads 
  ALTER COLUMN priority_key SET NOT NULL,
  ALTER COLUMN priority_key SET DEFAULT 'medium';

ALTER TABLE public.leads 
  ALTER COLUMN source_key SET NOT NULL,
  ALTER COLUMN source_key SET DEFAULT 'other';

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_priority_key_fkey'
  ) THEN
    ALTER TABLE public.leads 
    ADD CONSTRAINT leads_priority_key_fkey 
    FOREIGN KEY (priority_key) REFERENCES public.lead_priority_dim(key);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_source_key_fkey'
  ) THEN
    ALTER TABLE public.leads 
    ADD CONSTRAINT leads_source_key_fkey 
    FOREIGN KEY (source_key) REFERENCES public.lead_source_dim(key);
  END IF;
END $$;

-- Step 6: Drop old CHECK constraints
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_priority_check;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;

-- Step 7: Create sync trigger for priority (backward compatibility)
CREATE OR REPLACE FUNCTION public.tg_sync_lead_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If priority_key is null but priority is set, derive priority_key
  IF NEW.priority_key IS NULL AND NEW.priority IS NOT NULL THEN
    NEW.priority_key := CASE 
      WHEN LOWER(NEW.priority) IN ('low', 'medium', 'high', 'vip') THEN LOWER(NEW.priority)
      ELSE 'medium'
    END;
  END IF;
  
  -- Always sync priority from priority_key for consistency
  IF NEW.priority_key IS NOT NULL THEN
    NEW.priority := NEW.priority_key;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_lead_priority ON public.leads;
CREATE TRIGGER sync_lead_priority
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_sync_lead_priority();

-- Step 8: Create sync trigger for source (backward compatibility)
CREATE OR REPLACE FUNCTION public.tg_sync_lead_source()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If source_key is null but source is set, derive source_key
  IF NEW.source_key IS NULL AND NEW.source IS NOT NULL THEN
    NEW.source_key := CASE 
      WHEN NEW.source IN ('website', 'referral', 'social_media', 'advertising', 'direct', 'other') 
        THEN NEW.source
      WHEN NEW.source = 'facebook_paid' THEN 'facebook_paid'
      WHEN NEW.source = 'facebook_organic' THEN 'facebook_organic'
      WHEN NEW.source = 'whatsapp' THEN 'whatsapp'
      WHEN NEW.source = 'word_of_mouth' THEN 'word_of_mouth'
      ELSE 'other'
    END;
  END IF;
  
  -- Sync source from source_key for display/reports
  IF NEW.source_key IS NOT NULL THEN
    NEW.source := CASE 
      WHEN NEW.source_key IN ('facebook_paid', 'facebook_organic', 'whatsapp') THEN 'social_media'
      WHEN NEW.source_key = 'word_of_mouth' THEN 'referral'
      WHEN NEW.source_key IN ('website', 'referral', 'social_media', 'advertising', 'direct', 'other') 
        THEN NEW.source_key
      ELSE 'other'
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_lead_source ON public.leads;
CREATE TRIGGER sync_lead_source
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_sync_lead_source();

-- Step 9: Enable RLS on dimension tables
ALTER TABLE public.lead_priority_dim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_source_dim ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read dimension tables
CREATE POLICY "Anyone can read priority dimensions"
  ON public.lead_priority_dim
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read source dimensions"
  ON public.lead_source_dim
  FOR SELECT
  USING (true);