-- Add social links to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;