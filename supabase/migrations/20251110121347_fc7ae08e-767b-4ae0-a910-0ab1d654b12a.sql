-- Add template column to inspection_reports
ALTER TABLE public.inspection_reports 
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'classic';

-- Add comment for documentation
COMMENT ON COLUMN public.inspection_reports.template IS 'Template style for PDF report (classic, modern, elegant, premium)';