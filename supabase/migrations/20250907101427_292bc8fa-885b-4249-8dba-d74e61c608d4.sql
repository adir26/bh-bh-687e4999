-- Phase 0: Safety - ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;

-- 1) Add slug column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='slug'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN slug text;
  END IF;
END$$;

-- 2) Improved slugify: clean + replace spaces with hyphens (Hebrew supported)
-- Note: Postgres regex doesn't support \u ranges; using explicit Hebrew range א-ת
CREATE OR REPLACE FUNCTION public.slugify_company_name(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(
           lower(regexp_replace(trim(coalesce(name,'')),
                                 '[^a-zA-Z0-9\sא-ת]+', '', 'g')),
           '\s+', '-', 'g'
         )
$$;

-- 3) BEFORE INSERT/UPDATE trigger to auto-set slug if missing
CREATE OR REPLACE FUNCTION public.companies_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- ensure id exists (in case default isn't applied yet)
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    NEW.slug := concat(
      public.slugify_company_name(coalesce(NEW.name,'')),
      '-', substr(NEW.id::text, 1, 8)
    );
  END IF;

  -- normalize slug on update if someone tries to set it with spaces
  NEW.slug := regexp_replace(lower(NEW.slug), '\s+', '-', 'g');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_companies_set_slug ON public.companies;
CREATE TRIGGER trg_companies_set_slug
BEFORE INSERT OR UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.companies_set_slug();

-- 4) Backfill existing rows safely
UPDATE public.companies
SET slug = concat(public.slugify_company_name(name), '-', substr(id::text, 1, 8))
WHERE slug IS NULL OR length(trim(slug)) = 0;

-- 5) Enforce constraints/indexes after backfill
ALTER TABLE public.companies
  ALTER COLUMN slug SET NOT NULL;

-- unique constraint (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='companies' AND indexname='companies_slug_key'
  ) THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- 6) RLS: Restrict anon to only public & approved companies
-- First, drop overly broad policy if it exists to ensure anon is restricted
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='companies' AND policyname='Anyone can view companies'
  ) THEN
    DROP POLICY "Anyone can view companies" ON public.companies;
  END IF;
END$$;

-- Recreate an authenticated users view policy to preserve current behavior for logged-in users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='companies' AND policyname='authenticated_view_companies'
  ) THEN
    CREATE POLICY "authenticated_view_companies"
    ON public.companies
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END$$;

-- Anonymous can view only public & approved companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='companies' AND policyname='anon_view_public_companies'
  ) THEN
    CREATE POLICY "anon_view_public_companies"
    ON public.companies
    FOR SELECT
    TO anon
    USING (is_public = true AND status = 'approved');
  END IF;
END$$;

-- 7) RLS for products: anon can view only published products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='products' AND policyname='anon_view_published_products'
  ) THEN
    CREATE POLICY "anon_view_published_products"
    ON public.products
    FOR SELECT
    TO anon
    USING (is_published = true);
  END IF;
END$$;