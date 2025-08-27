-- Fix function search_path and include audience_json in public content
SET statement_timeout = 0;

-- Replace view to include audience_json and platform for client-side targeting
DROP VIEW IF EXISTS public.homepage_public;
CREATE VIEW public.homepage_public AS
SELECT 
  s.id as section_id,
  s.type,
  s.title_he as section_title,
  s.priority,
  s.platform,
  s.audience_json,
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

-- Replace helper function with fixed search_path and extra columns
CREATE OR REPLACE FUNCTION public.get_homepage_content(_platform TEXT DEFAULT 'web')
RETURNS TABLE (
  section_id UUID,
  section_type TEXT,
  section_title TEXT,
  section_priority INTEGER,
  section_platform TEXT,
  section_audience JSONB,
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
SET search_path TO public
AS $$
  SELECT 
    s.id,
    s.type,
    s.title_he,
    s.priority,
    s.platform,
    s.audience_json,
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

-- Fix search_path for trigger function
CREATE OR REPLACE FUNCTION public.update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path TO public;