-- ✅ Step 1: Improve companies_set_slug() function to handle Hebrew properly
CREATE OR REPLACE FUNCTION public.companies_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Generate ID if not exists
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  -- Generate slug if empty or NULL
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    -- Create slug from company name + first 8 chars of UUID
    -- Replace spaces with hyphens, remove extra hyphens
    NEW.slug := concat(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(trim(coalesce(NEW.name, ''))),
            '[^a-zA-Z0-9\sא-ת\-]+', '', 'g'  -- Keep Hebrew, English, numbers, spaces, hyphens
          ),
          '\s+', '-', 'g'  -- Replace spaces with single hyphen
        ),
        '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
      ),
      '-', substr(NEW.id::text, 1, 8)
    );
  END IF;

  -- Clean up leading/trailing hyphens from final slug
  NEW.slug := regexp_replace(
    regexp_replace(NEW.slug, '^-+', '', 'g'),  -- Remove leading hyphens
    '-+$', '', 'g'  -- Remove trailing hyphens
  );

  RETURN NEW;
END;
$function$;

-- ✅ Step 2: Force regenerate slugs for all companies with NULL or empty slugs
UPDATE public.companies 
SET slug = NULL, updated_at = now()
WHERE slug IS NULL OR slug = '' OR slug = 'null';

-- ✅ Step 3: Also regenerate slugs that look like UUIDs (old broken slugs)
UPDATE public.companies
SET slug = NULL, updated_at = now()
WHERE slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- ✅ The trigger will automatically regenerate slugs on the next update
-- Force trigger execution for all companies to regenerate slugs
UPDATE public.companies 
SET updated_at = now()
WHERE slug IS NULL;