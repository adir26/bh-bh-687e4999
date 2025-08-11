-- Phase: Products CRUD enablement, storage bucket and policies, validation trigger

-- Add currency column if missing
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ILS';

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_products_supplier ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);

-- Allow suppliers to delete their own products
CREATE POLICY IF NOT EXISTS "Suppliers can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = supplier_id);

-- Validate required fields when publishing
CREATE OR REPLACE FUNCTION public.validate_product_publish()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_published THEN
    IF NEW.name IS NULL OR length(btrim(NEW.name)) = 0 THEN
      RAISE EXCEPTION 'Product name is required to publish';
    END IF;
    IF NEW.price IS NULL OR NEW.price < 0 THEN
      RAISE EXCEPTION 'Product price must be >= 0 to publish';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_product_publish ON public.products;
CREATE TRIGGER trg_validate_product_publish
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.validate_product_publish();

-- Storage bucket for product images (private by default)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects on product-images bucket
-- Suppliers can upload only within their folder structure: supplierId/productId/filename
CREATE POLICY IF NOT EXISTS "Suppliers can upload product images"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY IF NOT EXISTS "Suppliers can update their product images"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY IF NOT EXISTS "Suppliers can delete their product images"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- Owners (authenticated) can view their images regardless of publish state
CREATE POLICY IF NOT EXISTS "Suppliers can view their product images"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- Public can view images only when product is published
CREATE POLICY IF NOT EXISTS "Public can view images of published products"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id::text = (storage.foldername(name))[2]
      AND p.is_published = true
  )
);
