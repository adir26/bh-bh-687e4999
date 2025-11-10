-- Inspection Items (Findings)
CREATE TABLE IF NOT EXISTS public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.inspection_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  status_check TEXT CHECK (status_check IN ('ok', 'not_ok', 'na')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  standard_code TEXT,
  standard_clause TEXT,
  standard_quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspection Media (per finding or report-level)
CREATE TABLE IF NOT EXISTS public.inspection_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.inspection_reports(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inspection_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspection Costs (per finding)
CREATE TABLE IF NOT EXISTS public.inspection_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inspection_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'יחידה',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspection Templates
CREATE TABLE IF NOT EXISTS public.inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  layout_json JSONB DEFAULT '{}',
  brand_color TEXT DEFAULT '#5B47FF',
  logo_url TEXT,
  intro_text TEXT,
  outro_text TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Standards Library (for autocomplete)
CREATE TABLE IF NOT EXISTS public.standards_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  standard_code TEXT,
  standard_clause TEXT,
  standard_quote TEXT,
  default_severity TEXT CHECK (default_severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add fields to inspection_reports for signatures and metadata
ALTER TABLE public.inspection_reports 
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS inspection_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS inspector_name TEXT,
ADD COLUMN IF NOT EXISTS inspector_signature_url TEXT,
ADD COLUMN IF NOT EXISTS client_signature_url TEXT,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.inspection_templates(id),
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#5B47FF',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS intro_text TEXT,
ADD COLUMN IF NOT EXISTS outro_text TEXT,
ADD COLUMN IF NOT EXISTS report_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS report_sent_via TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspection_items_report_id ON public.inspection_items(report_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_category ON public.inspection_items(category);
CREATE INDEX IF NOT EXISTS idx_inspection_items_status ON public.inspection_items(status_check);
CREATE INDEX IF NOT EXISTS idx_inspection_media_report_id ON public.inspection_media(report_id);
CREATE INDEX IF NOT EXISTS idx_inspection_media_item_id ON public.inspection_media(item_id);
CREATE INDEX IF NOT EXISTS idx_inspection_costs_item_id ON public.inspection_costs(item_id);
CREATE INDEX IF NOT EXISTS idx_standards_library_category ON public.standards_library(category);
CREATE INDEX IF NOT EXISTS idx_standards_library_title ON public.standards_library(title);

-- RLS Policies

-- inspection_items
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can manage their report items"
ON public.inspection_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_reports r
    WHERE r.id = inspection_items.report_id
    AND (r.supplier_id = auth.uid() OR r.created_by = auth.uid())
  )
);

CREATE POLICY "Clients can view items in their reports"
ON public.inspection_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_reports r
    WHERE r.id = inspection_items.report_id
    AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Admins have full access to items"
ON public.inspection_items
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- inspection_media
ALTER TABLE public.inspection_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can manage their report media"
ON public.inspection_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_reports r
    WHERE r.id = inspection_media.report_id
    AND (r.supplier_id = auth.uid() OR r.created_by = auth.uid())
  )
);

CREATE POLICY "Clients can view media in their reports"
ON public.inspection_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_reports r
    WHERE r.id = inspection_media.report_id
    AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Admins have full access to media"
ON public.inspection_media
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- inspection_costs
ALTER TABLE public.inspection_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can manage costs for their items"
ON public.inspection_costs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_items i
    JOIN public.inspection_reports r ON r.id = i.report_id
    WHERE i.id = inspection_costs.item_id
    AND (r.supplier_id = auth.uid() OR r.created_by = auth.uid())
  )
);

CREATE POLICY "Clients can view costs in their reports"
ON public.inspection_costs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.inspection_items i
    JOIN public.inspection_reports r ON r.id = i.report_id
    WHERE i.id = inspection_costs.item_id
    AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Admins have full access to costs"
ON public.inspection_costs
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- inspection_templates
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can manage their templates"
ON public.inspection_templates
FOR ALL
USING (auth.uid() = created_by OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Anyone can view templates"
ON public.inspection_templates
FOR SELECT
USING (true);

-- standards_library
ALTER TABLE public.standards_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view standards"
ON public.standards_library
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage standards"
ON public.standards_library
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Triggers for updated_at
CREATE TRIGGER update_inspection_items_updated_at
  BEFORE UPDATE ON public.inspection_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspection_templates_updated_at
  BEFORE UPDATE ON public.inspection_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets (via SQL if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('inspection-photos', 'inspection-photos', false),
  ('inspection-videos', 'inspection-videos', false),
  ('inspection-pdfs', 'inspection-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Suppliers can upload inspection photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Suppliers can view inspection photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Suppliers can delete their inspection photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Suppliers can upload inspection videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Suppliers can view inspection videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspection-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Suppliers can delete their inspection videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'inspection-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Suppliers can upload inspection PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-pdfs' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone authenticated can view inspection PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspection-pdfs' AND auth.role() = 'authenticated');

-- Sample standards data
INSERT INTO public.standards_library (domain, category, title, description, standard_code, standard_clause, standard_quote, default_severity) VALUES
('construction', 'קירות', 'סדקים בקיר', 'בדיקת סדקים מבניים בקירות', 'ת"י 1215', '3.2.1', 'סדקים מבניים אינם מותרים בקירות נושאים', 'high'),
('construction', 'רצפה', 'שיפוע רצפה', 'בדיקת שיפוע נכון לניקוז', 'ת"י 1918', '4.1', 'שיפוע מינימלי של 1% לכיוון ניקוז', 'medium'),
('plumbing', 'אינסטלציה', 'זליגת מים', 'בדיקת זליגות במערכת המים', 'ת"י 150', '2.3.4', 'אין להתיר זליגות במערכת האינסטלציה', 'high'),
('electrical', 'חשמל', 'הארקה', 'בדיקת מערכת הארקה', 'ת"י 61', '5.1.2', 'כל נקודת חשמל חייבת להיות מוארקת', 'high'),
('construction', 'דלתות וחלונות', 'אטימות', 'בדיקת אטימות דלתות וחלונות', 'ת"י 1038', '3.4', 'אטימות מלאה כנגד חדירת מים ורוח', 'medium')
ON CONFLICT DO NOTHING;