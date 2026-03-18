-- Fix remaining policies that failed due to pre-existing duplicates

-- Drop existing lead_assignments policies and recreate
DROP POLICY IF EXISTS "Suppliers can view their own assignments" ON public.lead_assignments;
DROP POLICY IF EXISTS "Suppliers can manage their own assignments" ON public.lead_assignments;

CREATE POLICY "Suppliers can manage their own assignments"
  ON public.lead_assignments
  FOR ALL
  TO authenticated
  USING (
    supplier_id = auth.uid() 
    OR public.get_user_role(auth.uid()) = 'admin'::user_role
  )
  WITH CHECK (
    supplier_id = auth.uid() 
    OR public.get_user_role(auth.uid()) = 'admin'::user_role
  );

-- Fix lead_scores: restrict to supplier + admin
DROP POLICY IF EXISTS "System can manage lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Suppliers can view their lead scores" ON public.lead_scores;

CREATE POLICY "Suppliers can view their lead scores"
  ON public.lead_scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_scores.lead_id
        AND (l.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'::user_role)
    )
  );

-- Fix Security Definer Views -> SECURITY INVOKER
DROP VIEW IF EXISTS public.homepage_public;
CREATE VIEW public.homepage_public
  WITH (security_invoker = true)
AS
  SELECT 
    s.id AS section_id,
    s.type,
    s.title_he AS section_title,
    s.priority,
    i.id AS item_id,
    i.title_he,
    i.subtitle_he,
    i.image_url,
    i.cta_label_he,
    i.link_type,
    i.link_target_id,
    i.link_url,
    i.order_index
  FROM homepage_sections s
  JOIN homepage_items i ON i.section_id = s.id
  WHERE s.status = 'published'
    AND s.is_active = true
    AND i.is_active = true
    AND (s.start_at IS NULL OR s.start_at <= now())
    AND (s.end_at IS NULL OR s.end_at >= now())
  ORDER BY s.priority, i.order_index;

DROP VIEW IF EXISTS public.top_categories_30d CASCADE;
CREATE VIEW public.top_categories_30d
  WITH (security_invoker = true)
AS
  SELECT 
    name AS category_name,
    id AS category_id,
    0 AS orders,
    0 AS gmv_ils
  FROM categories cat
  WHERE is_active = true
  ORDER BY name
  LIMIT 10;

DROP VIEW IF EXISTS public.top_suppliers_30d;
CREATE VIEW public.top_suppliers_30d
  WITH (security_invoker = true)
AS
  SELECT 
    COALESCE(c.name, p.full_name, 'ספק לא ידוע') AS name,
    o.supplier_id,
    count(o.id) AS orders,
    COALESCE(sum(o.amount), 0) AS gmv_ils,
    COALESCE(sum(o.amount * 0.05), 0) AS revenue_ils
  FROM orders o
  LEFT JOIN companies c ON c.id = o.supplier_id
  LEFT JOIN profiles p ON p.id = o.supplier_id AND p.role = 'supplier'
  WHERE o.created_at >= (CURRENT_DATE - '30 days'::interval)
    AND o.status <> 'cancelled'::order_status
  GROUP BY o.supplier_id, c.name, p.full_name
  HAVING count(o.id) > 0
  ORDER BY COALESCE(sum(o.amount), 0) DESC
  LIMIT 20;