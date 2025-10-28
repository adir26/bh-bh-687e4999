-- Add company_id column to leads table for tracking leads from public profiles
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);

-- Drop existing policy if it exists and recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can create leads for public companies" ON leads;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add RLS policy to allow public lead creation for approved companies
CREATE POLICY "Anyone can create leads for public companies"
ON leads
FOR INSERT
WITH CHECK (
  company_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = company_id 
    AND companies.is_public = true 
    AND companies.status = 'approved'
  )
);