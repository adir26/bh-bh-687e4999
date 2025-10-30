-- Add metadata column to leads table for storing Facebook Lead Ads campaign data
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add comment explaining the metadata structure
COMMENT ON COLUMN leads.metadata IS 'Stores additional lead source data like campaign_id, adset_name, ad_name, form_id, etc.';

-- Create index for better query performance on metadata
CREATE INDEX IF NOT EXISTS idx_leads_metadata ON leads USING gin(metadata);