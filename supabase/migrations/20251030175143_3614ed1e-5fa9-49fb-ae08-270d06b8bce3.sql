-- Add meeting_availability column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS meeting_availability jsonb DEFAULT jsonb_build_object(
  'available_days', '[]'::jsonb,
  'hours', jsonb_build_object('start', '09:00', 'end', '17:00'),
  'notes', ''
);

COMMENT ON COLUMN public.companies.meeting_availability IS 'Meeting availability settings: available_days (array of day names), hours (start/end times), and notes';