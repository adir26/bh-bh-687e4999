-- ========================================
-- Fix Product Catalog Issues (v2)
-- ========================================
-- Purpose: Enable suppliers to create products and upload images
-- + Fix public product display with signed URLs

-- Step 1: Fix RLS policy for product creation
-- Drop old restrictive policy
DROP POLICY IF EXISTS "Suppliers can create products" ON public.products;

-- Create new policy that supports both profiles.role and user_roles table
CREATE POLICY "Suppliers can create products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = supplier_id 
  AND (
    public.get_user_role(auth.uid()) = 'supplier'::user_role
    OR public.has_role(auth.uid(), 'supplier'::app_role)
  )
);

-- Step 2: Create product-images storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Drop existing storage policies (if any)
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Step 4: Create storage policies for product images

-- Policy 1: Suppliers can upload product images to their folder
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

-- Policy 2: Suppliers can update their own product images
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

-- Policy 3: Suppliers can delete their own product images
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

-- Policy 4: Anyone can view product images (public bucket)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');