-- Fix function issues by dropping and recreating
DROP FUNCTION IF EXISTS public.get_homepage_content(TEXT);

-- Replace helper function with correct signature and search_path
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