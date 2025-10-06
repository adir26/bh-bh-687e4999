-- Phase 1: Critical Security Fixes (Fixed)
-- Fix 1: Convert SECURITY DEFINER materialized views to secure functions

-- Drop existing materialized views
DROP MATERIALIZED VIEW IF EXISTS public.supplier_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.project_analytics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.popular_products CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.category_performance CASCADE;

-- Create secure function for supplier stats
CREATE OR REPLACE FUNCTION public.get_supplier_stats(_supplier_id UUID DEFAULT NULL)
RETURNS TABLE(
  supplier_id UUID,
  total_orders BIGINT,
  total_revenue NUMERIC,
  avg_rating NUMERIC,
  total_reviews BIGINT,
  active_leads BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS supplier_id,
    (SELECT COUNT(*) FROM orders o WHERE o.supplier_id = s.id AND o.status <> 'canceled')::BIGINT AS total_orders,
    COALESCE((SELECT SUM(amount) FROM orders o WHERE o.supplier_id = s.id AND o.status <> 'canceled'), 0) AS total_revenue,
    COALESCE((SELECT AVG(rating) FROM reviews r WHERE r.reviewed_id = s.id), 0) AS avg_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.reviewed_id = s.id)::BIGINT AS total_reviews,
    (SELECT COUNT(*) FROM leads l WHERE l.supplier_id = s.id AND l.status IN ('new', 'contacted', 'proposal_sent'))::BIGINT AS active_leads,
    CASE 
      WHEN (SELECT COUNT(*) FROM leads l WHERE l.supplier_id = s.id) > 0 
      THEN ROUND(
        ((SELECT COUNT(*) FROM orders o WHERE o.supplier_id = s.id)::NUMERIC / 
         (SELECT COUNT(*) FROM leads l WHERE l.supplier_id = s.id)::NUMERIC) * 100, 2
      )
      ELSE 0 
    END AS conversion_rate
  FROM profiles s
  WHERE s.role = 'supplier'
    AND (_supplier_id IS NULL OR s.id = _supplier_id)
    AND (s.id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
END;
$$;

-- Create secure function for project analytics
CREATE OR REPLACE FUNCTION public.get_project_analytics(_client_id UUID DEFAULT NULL)
RETURNS TABLE(
  client_id UUID,
  total_projects BIGINT,
  total_spent NUMERIC,
  active_projects BIGINT,
  completed_projects BIGINT,
  avg_project_value NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS client_id,
    (SELECT COUNT(*) FROM orders o WHERE o.client_id = p.id)::BIGINT AS total_projects,
    COALESCE((SELECT SUM(amount) FROM orders o WHERE o.client_id = p.id), 0) AS total_spent,
    (SELECT COUNT(*) FROM orders o WHERE o.client_id = p.id AND o.status IN ('pending', 'confirmed', 'in_progress'))::BIGINT AS active_projects,
    (SELECT COUNT(*) FROM orders o WHERE o.client_id = p.id AND o.status = 'completed')::BIGINT AS completed_projects,
    COALESCE((SELECT AVG(amount) FROM orders o WHERE o.client_id = p.id), 0) AS avg_project_value
  FROM profiles p
  WHERE p.role = 'client'
    AND (_client_id IS NULL OR p.id = _client_id)
    AND (p.id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
END;
$$;

-- Create secure function for popular products
CREATE OR REPLACE FUNCTION public.get_popular_products(_supplier_id UUID DEFAULT NULL, _limit INT DEFAULT 10)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  supplier_id UUID,
  view_count BIGINT,
  favorite_count BIGINT,
  order_count BIGINT,
  popularity_score NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.supplier_id,
    COALESCE((SELECT COUNT(*) FROM company_analytics pa WHERE pa.company_id = p.supplier_id AND pa.metric_name = 'product_view'), 0)::BIGINT AS view_count,
    COALESCE((SELECT COUNT(*) FROM user_favorites uf WHERE uf.product_id = p.id), 0)::BIGINT AS favorite_count,
    COALESCE((SELECT COUNT(DISTINCT bt.order_id) FROM budget_transactions bt WHERE bt.reference_id = p.id AND bt.reference_type = 'product'), 0)::BIGINT AS order_count,
    (
      COALESCE((SELECT COUNT(*) FROM company_analytics pa WHERE pa.company_id = p.supplier_id AND pa.metric_name = 'product_view'), 0) * 1 +
      COALESCE((SELECT COUNT(*) FROM user_favorites uf WHERE uf.product_id = p.id), 0) * 5 +
      COALESCE((SELECT COUNT(DISTINCT bt.order_id) FROM budget_transactions bt WHERE bt.reference_id = p.id AND bt.reference_type = 'product'), 0) * 10
    ) AS popularity_score
  FROM products p
  WHERE p.is_published = true
    AND (_supplier_id IS NULL OR p.supplier_id = _supplier_id)
    AND (p.supplier_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR p.is_published = true)
  ORDER BY popularity_score DESC
  LIMIT _limit;
END;
$$;

-- Create secure function for category performance
CREATE OR REPLACE FUNCTION public.get_category_performance(_category_id UUID DEFAULT NULL)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  supplier_count BIGINT,
  product_count BIGINT,
  total_orders BIGINT,
  total_revenue NUMERIC,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS category_id,
    c.name AS category_name,
    (SELECT COUNT(DISTINCT cc.company_id) FROM company_categories cc WHERE cc.category_id = c.id)::BIGINT AS supplier_count,
    (SELECT COUNT(DISTINCT p.id) FROM company_categories cc 
     JOIN products p ON p.supplier_id = cc.company_id 
     WHERE cc.category_id = c.id AND p.is_published = true)::BIGINT AS product_count,
    (SELECT COUNT(DISTINCT o.id) FROM company_categories cc 
     JOIN orders o ON o.supplier_id = cc.company_id 
     WHERE cc.category_id = c.id AND o.status <> 'canceled')::BIGINT AS total_orders,
    COALESCE((SELECT SUM(o.amount) FROM company_categories cc 
              JOIN orders o ON o.supplier_id = cc.company_id 
              WHERE cc.category_id = c.id AND o.status <> 'canceled'), 0) AS total_revenue,
    COALESCE((SELECT AVG(r.rating) FROM company_categories cc 
              JOIN reviews r ON r.reviewed_id = cc.company_id 
              WHERE cc.category_id = c.id), 0) AS avg_rating
  FROM categories c
  WHERE c.is_active = true
    AND (_category_id IS NULL OR c.id = _category_id);
END;
$$;

-- Fix 2: Create SECURITY DEFINER function to prevent infinite recursion in ideabook_collaborators RLS
CREATE OR REPLACE FUNCTION public.is_ideabook_collaborator(_ideabook_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM ideabook_collaborators 
    WHERE ideabook_id = _ideabook_id 
      AND user_id = _user_id
  );
$$;

-- Update ideabook_collaborators RLS policies to use the new function
DROP POLICY IF EXISTS "Ideabook owners can manage collaborators" ON public.ideabook_collaborators;
DROP POLICY IF EXISTS "Users can view collaborators of accessible ideabooks" ON public.ideabook_collaborators;

CREATE POLICY "Ideabook owners can manage collaborators"
ON public.ideabook_collaborators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ideabooks 
    WHERE id = ideabook_collaborators.ideabook_id 
      AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view collaborators of accessible ideabooks"
ON public.ideabook_collaborators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ideabooks 
    WHERE id = ideabook_collaborators.ideabook_id 
      AND (
        owner_id = auth.uid() 
        OR public.is_ideabook_collaborator(id, auth.uid())
        OR public.has_role(auth.uid(), 'admin')
      )
  )
);

-- Fix 3: Add SET search_path = public to all functions missing it
CREATE OR REPLACE FUNCTION public.update_homepage_sections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_lead_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NULL THEN
    NEW.status := 'new';
  END IF;

  IF NEW.status NOT IN ('new', 'contacted', 'proposal_sent', 'won', 'lost') THEN
    RAISE EXCEPTION 'Invalid lead status: %', NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_product_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published THEN
    IF NEW.name IS NULL OR length(btrim(NEW.name)) = 0 THEN
      RAISE EXCEPTION 'Product name is required to publish';
    END IF;
    IF NEW.price IS NULL OR NEW.price < 0 THEN
      RAISE EXCEPTION 'Product price must be >= 0 to publish';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_communication_automations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.companies_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;

  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    NEW.slug := concat(
      public.slugify_company_name(coalesce(NEW.name,'')),
      '-', substr(NEW.id::text, 1, 8)
    );
  END IF;

  NEW.slug := regexp_replace(lower(NEW.slug), '\s+', '-', 'g');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_categories_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.slug IS NULL OR LENGTH(TRIM(NEW.slug)) = 0) THEN
    NEW.slug := public.slugify(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'NULL') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

-- Fix 4: Move pg_trgm extension to dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Comment on security fixes
COMMENT ON FUNCTION public.get_supplier_stats IS 'Phase 1 Security Fix: Replaced SECURITY DEFINER materialized view with validated function';
COMMENT ON FUNCTION public.get_project_analytics IS 'Phase 1 Security Fix: Replaced SECURITY DEFINER materialized view with validated function';
COMMENT ON FUNCTION public.get_popular_products IS 'Phase 1 Security Fix: Replaced SECURITY DEFINER materialized view with validated function';
COMMENT ON FUNCTION public.get_category_performance IS 'Phase 1 Security Fix: Replaced SECURITY DEFINER materialized view with validated function';
COMMENT ON FUNCTION public.is_ideabook_collaborator IS 'Phase 1 Security Fix: Prevents infinite recursion in RLS policies';
COMMENT ON SCHEMA extensions IS 'Phase 1 Security Fix: Dedicated schema for PostgreSQL extensions';