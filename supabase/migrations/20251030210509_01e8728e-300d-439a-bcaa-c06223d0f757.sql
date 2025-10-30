-- Lead scores table
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lead_id)
);

-- Add missing fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_to_share BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS end_date DATE;

-- Lead-to-supplier assignment table
CREATE TABLE IF NOT EXISTS lead_assignments (
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (lead_id, supplier_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_consent ON leads(consent_to_share);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_supplier ON lead_assignments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON lead_assignments(lead_id);

-- Enable RLS
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_scores
CREATE POLICY "Suppliers can view scores of their assigned leads"
ON lead_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM leads l
    JOIN lead_assignments la ON la.lead_id = l.id
    WHERE lead_scores.lead_id = l.id
      AND l.consent_to_share = true
      AND la.supplier_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all lead scores"
ON lead_scores FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage lead scores"
ON lead_scores FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for lead_assignments
CREATE POLICY "Suppliers can view their own assignments"
ON lead_assignments FOR SELECT
USING (supplier_id = auth.uid());

CREATE POLICY "Admins can manage all assignments"
ON lead_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage assignments"
ON lead_assignments FOR ALL
USING (true)
WITH CHECK (true);

-- Function to auto-assign leads to relevant suppliers
CREATE OR REPLACE FUNCTION auto_assign_lead_to_suppliers()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign to supplier_id if exists
  IF NEW.supplier_id IS NOT NULL THEN
    INSERT INTO lead_assignments (lead_id, supplier_id)
    VALUES (NEW.id, NEW.supplier_id)
    ON CONFLICT (lead_id, supplier_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign on lead creation
DROP TRIGGER IF EXISTS trigger_auto_assign_lead ON leads;
CREATE TRIGGER trigger_auto_assign_lead
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION auto_assign_lead_to_suppliers();