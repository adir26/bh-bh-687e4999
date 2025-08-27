-- Create homepage CMS tables
CREATE TABLE public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('banner', 'category_carousel', 'supplier_cards', 'tabs')),
  title_he TEXT,
  description_he TEXT,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  start_at TIMESTAMP WITH TIME ZONE NULL,
  end_at TIMESTAMP WITH TIME ZONE NULL,
  platform TEXT CHECK (platform IN ('web', 'ios', 'android')) DEFAULT 'web',
  audience_json JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.homepage_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  title_he TEXT,
  subtitle_he TEXT,
  image_url TEXT,
  cta_label_he TEXT,
  link_type TEXT CHECK (link_type IN ('url', 'category', 'supplier', 'screen')),
  link_target_id TEXT NULL,
  link_url TEXT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table for telemetry
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NULL,
  type TEXT NOT NULL CHECK (type IN ('impression', 'click')),
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Create public view for homepage content
CREATE VIEW public.homepage_public AS
SELECT 
  s.id as section_id,
  s.type,
  s.title_he as section_title,
  s.priority,
  i.id as item_id,
  i.title_he,
  i.subtitle_he,
  i.image_url,
  i.cta_label_he,
  i.link_type,
  i.link_target_id,
  i.link_url,
  i.order_index
FROM public.homepage_sections s
JOIN public.homepage_items i ON i.section_id = s.id
WHERE s.status = 'published' 
  AND s.is_active = true
  AND i.is_active = true
  AND (s.start_at IS NULL OR s.start_at <= now())
  AND (s.end_at IS NULL OR s.end_at >= now())
ORDER BY s.priority ASC, i.order_index ASC;

-- Enable RLS on all tables
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_sections
CREATE POLICY "Admins can manage homepage sections"
ON public.homepage_sections
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for homepage_items
CREATE POLICY "Admins can manage homepage items"
ON public.homepage_items
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for events (system can insert, admins can read)
CREATE POLICY "System can insert events"
ON public.events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view events"
ON public.events
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create homepage storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homepage', 'homepage', true);

-- Storage policies for homepage bucket
CREATE POLICY "Admins can upload homepage images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'homepage' AND 
  get_user_role(auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Admins can update homepage images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'homepage' AND 
  get_user_role(auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Admins can delete homepage images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'homepage' AND 
  get_user_role(auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Public can view homepage images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'homepage');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_homepage_sections_updated_at();

-- Create indexes for performance
CREATE INDEX idx_homepage_sections_status_active ON public.homepage_sections (status, is_active);
CREATE INDEX idx_homepage_sections_schedule ON public.homepage_sections (start_at, end_at);
CREATE INDEX idx_homepage_items_section_order ON public.homepage_items (section_id, order_index);
CREATE INDEX idx_events_entity ON public.events (entity, entity_id);
CREATE INDEX idx_events_occurred_at ON public.events (occurred_at);

-- Helper function to get public homepage content
CREATE OR REPLACE FUNCTION public.get_homepage_content(_platform TEXT DEFAULT 'web')
RETURNS TABLE (
  section_id UUID,
  section_type TEXT,
  section_title TEXT,
  section_priority INTEGER,
  item_id UUID,
  item_title TEXT,
  item_subtitle TEXT,
  item_image_url TEXT,
  item_cta_label TEXT,
  item_link_type TEXT,
  item_link_target_id TEXT,
  item_link_url TEXT,
  item_order INTEGER
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    s.id,
    s.type,
    s.title_he,
    s.priority,
    i.id,
    i.title_he,
    i.subtitle_he,
    i.image_url,
    i.cta_label_he,
    i.link_type,
    i.link_target_id,
    i.link_url,
    i.order_index
  FROM public.homepage_sections s
  JOIN public.homepage_items i ON i.section_id = s.id
  WHERE s.status = 'published' 
    AND s.is_active = true
    AND i.is_active = true
    AND s.platform = _platform
    AND (s.start_at IS NULL OR s.start_at <= now())
    AND (s.end_at IS NULL OR s.end_at >= now())
  ORDER BY s.priority ASC, i.order_index ASC;
$$;