-- Create company_media storage bucket for logos, banners, and gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company_media',
  'company_media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for company_media bucket

-- Allow suppliers to upload their own company media
CREATE POLICY "Suppliers can upload their company media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_media' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Allow suppliers to update their own company media
CREATE POLICY "Suppliers can update their company media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company_media' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Allow suppliers to delete their own company media
CREATE POLICY "Suppliers can delete their company media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_media' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Allow public read access to all company media
CREATE POLICY "Public can view company media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company_media');