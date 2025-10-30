-- Add campaign_name column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS campaign_name text;

COMMENT ON COLUMN public.leads.campaign_name IS 'Name of the marketing campaign that generated this lead';

-- Create index for campaign filtering
CREATE INDEX IF NOT EXISTS idx_leads_campaign_name ON public.leads(campaign_name) WHERE campaign_name IS NOT NULL;