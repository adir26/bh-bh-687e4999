-- ========================================
-- Fix Company Slugs - Latin/UUID Only
-- ========================================
-- Purpose: Generate clean slugs without Hebrew characters
-- - If name has Latin characters: use them + UUID
-- - If name is fully Hebrew: use company-UUID format

-- Step 1: Update the slug generation function
CREATE OR REPLACE FUNCTION public.companies_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  clean_name TEXT;
  latin_only TEXT;
BEGIN
  -- Generate ID if not exists
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  -- Generate slug if empty or NULL
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    -- Step 1: Clean the name (lowercase, trim)
    clean_name := lower(trim(coalesce(NEW.name, '')));
    
    -- Step 2: Extract ONLY Latin characters, numbers, and spaces
    latin_only := regexp_replace(clean_name, '[^a-z0-9\s]+', '', 'g');
    
    -- Step 3: Replace spaces with hyphens, remove multiple hyphens
    latin_only := regexp_replace(
      regexp_replace(latin_only, '\s+', '-', 'g'),
      '-+', '-', 'g'
    );
    
    -- Step 4: Check if we have meaningful content (at least 3 characters)
    IF length(regexp_replace(latin_only, '[^a-z0-9]', '', 'g')) >= 3 THEN
      -- Use latin part + UUID
      NEW.slug := concat(latin_only, '-', substr(NEW.id::text, 1, 8));
    ELSE
      -- Name is fully Hebrew - use company-UUID format
      NEW.slug := concat('company-', substr(NEW.id::text, 1, 12));
    END IF;
  END IF;

  -- Clean up leading/trailing hyphens
  NEW.slug := regexp_replace(
    regexp_replace(NEW.slug, '^-+', '', 'g'),
    '-+$', '', 'g'
  );

  RETURN NEW;
END;
$function$;

-- Step 2: Create the trigger (was missing!)
DROP TRIGGER IF EXISTS companies_set_slug_trigger ON public.companies;

CREATE TRIGGER companies_set_slug_trigger
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.companies_set_slug();

-- Step 3: Update existing slugs with Hebrew characters
UPDATE public.companies
SET slug = NULL, updated_at = now()
WHERE slug ~ '[א-ת]';

-- Step 4: Update NULL/empty slugs
UPDATE public.companies
SET slug = NULL, updated_at = now()
WHERE slug IS NULL OR slug = '' OR slug = 'null';

-- Step 5: Update pure UUID slugs
UPDATE public.companies
SET slug = NULL, updated_at = now()
WHERE slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 6: Trigger regeneration for all NULL slugs
UPDATE public.companies
SET updated_at = now()
WHERE slug IS NULL;