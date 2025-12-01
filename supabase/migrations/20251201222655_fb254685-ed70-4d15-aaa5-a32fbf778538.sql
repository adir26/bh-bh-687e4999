-- Add Facebook-specific fields to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS secondary_phone text,
ADD COLUMN IF NOT EXISTS whatsapp_phone text,
ADD COLUMN IF NOT EXISTS channel text,
ADD COLUMN IF NOT EXISTS stage text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS form_name text;

-- Add indexes for the new phone fields for duplicate detection
CREATE INDEX IF NOT EXISTS idx_leads_secondary_phone ON leads(supplier_id, secondary_phone) WHERE secondary_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp_phone ON leads(supplier_id, whatsapp_phone) WHERE whatsapp_phone IS NOT NULL;

COMMENT ON COLUMN leads.secondary_phone IS 'Secondary phone number from Facebook leads';
COMMENT ON COLUMN leads.whatsapp_phone IS 'WhatsApp phone number from Facebook leads';
COMMENT ON COLUMN leads.channel IS 'Marketing channel (Email/Organic/Ad)';
COMMENT ON COLUMN leads.stage IS 'Lead stage in the pipeline';
COMMENT ON COLUMN leads.form_name IS 'Facebook form name or campaign identifier';