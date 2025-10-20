-- Fix product-images bucket and storage policies
-- Make bucket public and add proper access policies

-- Step 1: Make product-images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- Step 2: Drop existing storage policies (if any)
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Step 3: Create new storage policies
-- Allow public read access
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow suppliers to upload their images
-- Path format: supplierId/productId/filename.ext
CREATE POLICY "Suppliers can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Allow suppliers to update their images
CREATE POLICY "Suppliers can update their product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Allow suppliers to delete their images
CREATE POLICY "Suppliers can delete their product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );