-- Add new fields to companies table for richer profiles
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for company media (logos, banners, gallery)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-media',
  'company-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for company-media bucket
CREATE POLICY "Public read access to company media"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-media');

CREATE POLICY "Authenticated users can upload company media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Company owners can update their media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Company owners can delete their media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);