-- Add about_text column to companies table for rich supplier description
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS about_text text;

COMMENT ON COLUMN public.companies.about_text IS 'Rich text description for supplier profile - longer and more detailed than description';
