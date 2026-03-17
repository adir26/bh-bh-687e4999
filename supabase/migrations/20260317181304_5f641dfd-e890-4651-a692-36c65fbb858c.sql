-- Fix 'canceled' -> 'cancelled' in get_supplier_stats function
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
    (SELECT COUNT(*) FROM orders o WHERE o.supplier_id = s.id AND o.status <> 'cancelled')::BIGINT AS total_orders,
    COALESCE((SELECT SUM(amount) FROM orders o WHERE o.supplier_id = s.id AND o.status <> 'cancelled'), 0) AS total_revenue,
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
    AND (_supplier_id IS NULL OR s.id = _supplier_id);
END;
$$;

-- Fix 'canceled' -> 'cancelled' in get_category_stats function
CREATE OR REPLACE FUNCTION public.get_category_stats(_category_id UUID DEFAULT NULL)
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
     WHERE cc.category_id = c.id AND o.status <> 'cancelled')::BIGINT AS total_orders,
    COALESCE((SELECT SUM(o.amount) FROM company_categories cc 
              JOIN orders o ON o.supplier_id = cc.company_id 
              WHERE cc.category_id = c.id AND o.status <> 'cancelled'), 0) AS total_revenue,
    COALESCE((SELECT AVG(r.rating) FROM company_categories cc 
              JOIN reviews r ON r.reviewed_id = cc.company_id 
              WHERE cc.category_id = c.id), 0) AS avg_rating
  FROM categories c
  WHERE c.is_active = true
    AND (_category_id IS NULL OR c.id = _category_id);
END;
$$;