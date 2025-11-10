-- Add inspector contact details to inspection_reports
ALTER TABLE public.inspection_reports
ADD COLUMN IF NOT EXISTS inspector_phone TEXT,
ADD COLUMN IF NOT EXISTS inspector_email TEXT,
ADD COLUMN IF NOT EXISTS inspector_company TEXT,
ADD COLUMN IF NOT EXISTS inspector_license TEXT;

-- Create storage bucket for inspection reports if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-reports',
  'inspection-reports',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for inspection-reports bucket
CREATE POLICY "Anyone can view inspection report files"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspection-reports');

CREATE POLICY "Authenticated users can upload inspection report files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-reports' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own inspection report files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inspection-reports' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own inspection report files"
ON storage.objects FOR DELETE
USING (bucket_id = 'inspection-reports' AND auth.uid() IS NOT NULL);