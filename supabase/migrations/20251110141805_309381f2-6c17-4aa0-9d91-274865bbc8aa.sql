-- Create assets bucket for fonts and other static assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760, -- 10MB limit
  ARRAY['font/ttf', 'font/otf', 'application/x-font-ttf', 'application/font-sfnt']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['font/ttf', 'font/otf', 'application/x-font-ttf', 'application/font-sfnt'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from assets" ON storage.objects;

-- Create RLS policy for public read access to assets bucket
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Create RLS policy for authenticated users to upload to assets bucket
CREATE POLICY "Authenticated users can upload to assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Create RLS policy for authenticated users to update assets
CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets');

-- Create RLS policy for authenticated users to delete from assets
CREATE POLICY "Authenticated users can delete from assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');