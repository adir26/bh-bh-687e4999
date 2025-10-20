-- ====================================
-- Step 1: Create product_images table
-- ====================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(product_id, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary);

-- ====================================
-- Step 2: Add products_count to companies
-- ====================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS products_count integer NOT NULL DEFAULT 0;

-- Update existing values
UPDATE public.companies c
SET products_count = (
  SELECT COUNT(*) FROM public.products p 
  WHERE p.supplier_id = c.owner_id
)
WHERE products_count = 0;

-- ====================================
-- Step 3: Triggers for auto-sync
-- ====================================

-- Trigger for products_count sync
CREATE OR REPLACE FUNCTION public.sync_products_count()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.companies 
    SET products_count = products_count + 1
    WHERE owner_id = NEW.supplier_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.companies 
    SET products_count = GREATEST(products_count - 1, 0)
    WHERE owner_id = OLD.supplier_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_sync_products_count_ins ON public.products;
CREATE TRIGGER trg_sync_products_count_ins
AFTER INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_products_count();

DROP TRIGGER IF EXISTS trg_sync_products_count_del ON public.products;
CREATE TRIGGER trg_sync_products_count_del
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_products_count();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.touch_products_updated_at()
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_touch_products ON public.products;
CREATE TRIGGER trg_touch_products
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_products_updated_at();

-- ====================================
-- Step 4: RLS Policies for product_images
-- ====================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public can read images of published products
CREATE POLICY "Public read images for published products"
  ON public.product_images FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id 
        AND p.is_published = true
    )
  );

-- Suppliers manage their own images
CREATE POLICY "Suppliers manage their product images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id 
        AND p.supplier_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id 
        AND p.supplier_id = auth.uid()
    )
  );