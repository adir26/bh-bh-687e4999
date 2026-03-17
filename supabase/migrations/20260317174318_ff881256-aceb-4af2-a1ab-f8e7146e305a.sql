
-- Add new columns to bookings table
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS location TEXT;
