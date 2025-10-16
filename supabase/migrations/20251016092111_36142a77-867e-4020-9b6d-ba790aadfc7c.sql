-- Fix product-images bucket storage policies
-- Issue: Use correct foldername function

-- Drop existing policies
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Recreate with correct function name
CREATE POLICY "Suppliers can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.get_user_role(auth.uid()) = 'supplier'::user_role
    OR public.has_role(auth.uid(), 'supplier'::app_role)
  )
);

CREATE POLICY "Suppliers can update their product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.get_user_role(auth.uid()) = 'supplier'::user_role
    OR public.has_role(auth.uid(), 'supplier'::app_role)
  )
);

CREATE POLICY "Suppliers can delete their product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    public.get_user_role(auth.uid()) = 'supplier'::user_role
    OR public.has_role(auth.uid(), 'supplier'::app_role)
  )
);

-- Public view access (bucket is public)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');