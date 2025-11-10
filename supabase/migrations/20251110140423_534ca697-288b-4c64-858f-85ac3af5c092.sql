-- Add signature_data column to inspection_reports
ALTER TABLE inspection_reports 
ADD COLUMN IF NOT EXISTS signature_data text;