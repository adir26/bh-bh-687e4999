-- Create inspection_reports table
CREATE TABLE IF NOT EXISTS public.inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  client_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'home_inspection',
    'plumbing',
    'supervision',
    'leak_detection',
    'qa',
    'safety',
    'consultants',
    'handover',
    'common_areas'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'final', 'sent')),
  version INTEGER NOT NULL DEFAULT 1,
  is_recurring BOOLEAN DEFAULT false,
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

-- Suppliers can view and manage their own reports
CREATE POLICY "Suppliers can manage their reports"
ON public.inspection_reports
FOR ALL
USING (auth.uid() = supplier_id OR auth.uid() = created_by);

-- Clients can view reports for their projects
CREATE POLICY "Clients can view their reports"
ON public.inspection_reports
FOR SELECT
USING (auth.uid() = client_id);

-- Admins have full access
CREATE POLICY "Admins have full access to reports"
ON public.inspection_reports
FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Create index for performance
CREATE INDEX idx_inspection_reports_supplier ON public.inspection_reports(supplier_id);
CREATE INDEX idx_inspection_reports_client ON public.inspection_reports(client_id);
CREATE INDEX idx_inspection_reports_status ON public.inspection_reports(status);
CREATE INDEX idx_inspection_reports_updated_at ON public.inspection_reports(updated_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_inspection_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_inspection_reports_updated_at
BEFORE UPDATE ON public.inspection_reports
FOR EACH ROW
EXECUTE FUNCTION update_inspection_reports_updated_at();