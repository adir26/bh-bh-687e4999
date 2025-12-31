-- Add why_choose_us field for "למה לבחור בנו" section
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS why_choose_us jsonb DEFAULT '[]'::jsonb;