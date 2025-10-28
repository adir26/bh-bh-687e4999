-- Add status tracking columns to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing photos based on is_public flag
UPDATE photos SET status = 'approved' WHERE is_public = true AND status IS NULL;
UPDATE photos SET status = 'pending' WHERE is_public = false AND status IS NULL;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_reviewed_at ON photos(reviewed_at);

-- RLS: Allow admins to update photo status and review fields
CREATE POLICY "Admins can update photo status" ON public.photos
    FOR UPDATE 
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');