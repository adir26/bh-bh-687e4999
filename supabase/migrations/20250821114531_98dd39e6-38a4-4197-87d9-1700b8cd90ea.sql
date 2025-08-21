-- Categories table enhancements
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Uniqueness & search indexes
CREATE UNIQUE INDEX IF NOT EXISTS categories_parent_name_uniq
  ON public.categories(COALESCE(parent_id,'00000000-0000-0000-0000-000000000000'::UUID), LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique 
  ON public.categories(LOWER(slug));

CREATE INDEX IF NOT EXISTS categories_parent_position_idx 
  ON public.categories(parent_id, position);

CREATE INDEX IF NOT EXISTS categories_is_active_idx 
  ON public.categories(is_active);

CREATE INDEX IF NOT EXISTS categories_is_public_idx 
  ON public.categories(is_public);

-- Slugify helper function
CREATE OR REPLACE FUNCTION public.slugify(txt TEXT) 
RETURNS TEXT 
LANGUAGE SQL 
IMMUTABLE AS $$
  SELECT REGEXP_REPLACE(LOWER(TRIM(txt)), '[^א-תa-z0-9\-\s]+', '', 'g')::TEXT
$$;

-- Auto-slug trigger function
CREATE OR REPLACE FUNCTION public.tg_categories_slug() 
RETURNS TRIGGER 
LANGUAGE PLPGSQL AS $$
BEGIN
  IF (NEW.slug IS NULL OR LENGTH(TRIM(NEW.slug)) = 0) THEN
    NEW.slug := public.slugify(NEW.name);
  END IF;
  RETURN NEW;
END $$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trg_categories_slug ON public.categories;
CREATE TRIGGER trg_categories_slug 
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_categories_slug();

-- Admin reorder categories RPC
CREATE OR REPLACE FUNCTION public.admin_reorder_categories(_ids UUID[])
RETURNS VOID 
LANGUAGE PLPGSQL 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  _i INTEGER := 1;
  _id UUID;
BEGIN
  -- Guard admin role
  IF public.get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;
  
  -- Update positions atomically
  FOREACH _id IN ARRAY _ids LOOP
    UPDATE public.categories 
    SET position = _i 
    WHERE id = _id;
    _i := _i + 1;
  END LOOP;
END$$;

-- Enhanced RLS policies for categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- Comprehensive admin policy
CREATE POLICY "Admin full access to categories"
  ON public.categories FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Public read access to active categories
CREATE POLICY "Public read access to active categories"
  ON public.categories FOR SELECT
  USING (is_public = TRUE AND is_active = TRUE);

-- Update existing categories to have default values for new columns
UPDATE public.categories 
SET 
  position = 0,
  is_active = TRUE,
  is_public = TRUE,
  slug = public.slugify(name)
WHERE 
  position IS NULL OR 
  is_active IS NULL OR 
  is_public IS NULL OR 
  slug IS NULL;