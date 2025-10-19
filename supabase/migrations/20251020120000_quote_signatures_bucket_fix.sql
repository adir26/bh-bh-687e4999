-- Ensure quote-signatures bucket exists and remains private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-signatures',
  'quote-signatures',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Double-check that RLS is enforced on the bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'quote-signatures';
