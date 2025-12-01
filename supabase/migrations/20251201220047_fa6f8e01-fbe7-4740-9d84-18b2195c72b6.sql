-- Create lead_imports table for tracking import history
CREATE TABLE IF NOT EXISTS public.lead_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'xml')),
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add missing fields to leads table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'leads' 
                 AND column_name = 'created_via') THEN
    ALTER TABLE public.leads ADD COLUMN created_via TEXT DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'leads' 
                 AND column_name = 'campaign') THEN
    ALTER TABLE public.leads ADD COLUMN campaign TEXT;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lead_imports_supplier_id ON public.lead_imports(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_created_at ON public.lead_imports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone_supplier ON public.leads(contact_phone, supplier_id);
CREATE INDEX IF NOT EXISTS idx_leads_email_supplier ON public.leads(contact_email, supplier_id);

-- Enable RLS
ALTER TABLE public.lead_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_imports
CREATE POLICY "Suppliers can view their own import history"
  ON public.lead_imports FOR SELECT
  USING (supplier_id = auth.uid());

CREATE POLICY "Suppliers can insert their own imports"
  ON public.lead_imports FOR INSERT
  WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Suppliers can update their own imports"
  ON public.lead_imports FOR UPDATE
  USING (supplier_id = auth.uid());

-- Add comment for documentation
COMMENT ON TABLE public.lead_imports IS 'Tracks history of lead imports from CSV/XML files';
COMMENT ON COLUMN public.leads.created_via IS 'Source of lead creation: manual, import, api, form';
COMMENT ON COLUMN public.leads.campaign IS 'Marketing campaign identifier for lead tracking';