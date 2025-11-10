-- Make client_id nullable in inspection_reports table
-- This allows creating a report without assigning a client initially
ALTER TABLE public.inspection_reports 
ALTER COLUMN client_id DROP NOT NULL;