-- Create supplier dashboard RPC functions with security and authorization

-- 1. Main dashboard metrics function
CREATE OR REPLACE FUNCTION public.supplier_dashboard_metrics(
  _supplier_id uuid,
  _from timestamptz,
  _to timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
  company_exists boolean;
BEGIN
  -- Authorization: ensure caller owns this company/supplier
  SELECT EXISTS (
    SELECT 1 
    FROM companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  -- Also check if user is directly the supplier (for individual suppliers)
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  -- Calculate metrics
  WITH
  lead_base AS (
    SELECT * FROM leads
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  quote_base AS (
    SELECT * FROM quotes
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  order_base AS (
    SELECT * FROM orders
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  review_base AS (
    SELECT * FROM reviews
    WHERE reviewed_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  -- Previous period for comparison (same duration)
  prev_period_duration AS (
    SELECT _to - _from AS duration
  ),
  prev_order_base AS (
    SELECT * FROM orders
    WHERE supplier_id = _supplier_id
      AND created_at >= (_from - (SELECT duration FROM prev_period_duration))
      AND created_at < _from
  )
  SELECT jsonb_build_object(
    'leads_new', (SELECT count(*) FROM lead_base),
    'leads_in_progress', (
      SELECT count(*) 
      FROM leads 
      WHERE supplier_id = _supplier_id 
        AND status IN ('new', 'contacted', 'proposal_sent')
        AND created_at < _to
    ),
    'lead_conversion_rate', (
      CASE 
        WHEN (SELECT count(*) FROM lead_base) > 0 THEN
          ROUND(
            (SELECT count(*) FROM order_base WHERE status <> 'canceled')::numeric / 
            (SELECT count(*) FROM lead_base)::numeric * 100, 2
          )
        ELSE 0
      END
    ),
    'quotes_sent', (SELECT count(*) FROM quote_base),
    'quotes_accepted', (
      SELECT count(*) 
      FROM quotes 
      WHERE supplier_id = _supplier_id 
        AND status = 'accepted'
        AND sent_at >= _from AND sent_at < _to
    ),
    'orders_active', (
      SELECT count(*) 
      FROM orders 
      WHERE supplier_id = _supplier_id 
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND created_at < _to
    ),
    'orders_completed', (
      SELECT count(*) 
      FROM order_base 
      WHERE status = 'completed'
    ),
    'revenue', COALESCE((
      SELECT sum(amount) 
      FROM order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'aov', COALESCE((
      SELECT ROUND(avg(amount), 2) 
      FROM order_base 
      WHERE status = 'completed'
    ), 0),
    'rating_avg', COALESCE((
      SELECT ROUND(avg(rating), 1) 
      FROM review_base
    ), 0),
    'reviews_count', (SELECT count(*) FROM review_base),
    'avg_response_time_hours', (
      SELECT COALESCE(
        ROUND(
          AVG(EXTRACT(EPOCH FROM (last_contact_date - created_at)) / 3600)::numeric, 1
        ), 0
      )
      FROM lead_base 
      WHERE last_contact_date IS NOT NULL
    ),
    -- Previous period comparison data
    'prev_revenue', COALESCE((
      SELECT sum(amount) 
      FROM prev_order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'prev_orders_completed', (
      SELECT count(*) 
      FROM prev_order_base 
      WHERE status = 'completed'
    )
  ) INTO v;

  RETURN v;
END;
$$;

-- 2. Time series data function for charts
CREATE OR REPLACE FUNCTION public.supplier_timeseries(
  _supplier_id uuid,
  _from timestamptz,
  _to timestamptz,
  _grain text  -- 'day'|'week'|'month'
) RETURNS TABLE(
  bucket timestamptz,
  revenue numeric,
  leads_count int,
  orders_count int,
  reviews_count int,
  profile_views int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_exists boolean;
BEGIN
  -- Authorization check
  SELECT EXISTS (
    SELECT 1 
    FROM companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  RETURN QUERY
  WITH series AS (
    SELECT generate_series(
      date_trunc(_grain, _from), 
      date_trunc(_grain, _to), 
      CASE 
        WHEN _grain = 'day' THEN interval '1 day'
        WHEN _grain = 'week' THEN interval '1 week'
        ELSE interval '1 month' 
      END
    ) AS bucket
  ),
  o AS (
    SELECT 
      date_trunc(_grain, created_at) AS b, 
      sum(amount) AS revenue, 
      count(*)::int AS orders_count
    FROM orders 
    WHERE supplier_id = _supplier_id 
      AND created_at >= _from 
      AND created_at < _to
      AND status <> 'canceled'
    GROUP BY 1
  ),
  l AS (
    SELECT 
      date_trunc(_grain, created_at) AS b, 
      count(*)::int AS leads_count
    FROM leads 
    WHERE supplier_id = _supplier_id 
      AND created_at >= _from 
      AND created_at < _to
    GROUP BY 1
  ),
  r AS (
    SELECT 
      date_trunc(_grain, created_at) AS b, 
      count(*)::int AS reviews_count
    FROM reviews 
    WHERE reviewed_id = _supplier_id 
      AND created_at >= _from 
      AND created_at < _to
    GROUP BY 1
  ),
  v AS (
    SELECT 
      date_trunc(_grain, created_at) AS b, 
      sum(COALESCE((metadata->>'views')::int, 1))::int AS profile_views
    FROM company_analytics 
    WHERE company_id = _supplier_id 
      AND metric_name = 'profile_view'
      AND created_at >= _from 
      AND created_at < _to
    GROUP BY 1
  )
  SELECT 
    s.bucket,
    COALESCE(o.revenue, 0),
    COALESCE(l.leads_count, 0),
    COALESCE(o.orders_count, 0),
    COALESCE(r.reviews_count, 0),
    COALESCE(v.profile_views, 0)
  FROM series s
  LEFT JOIN o ON o.b = s.bucket
  LEFT JOIN l ON l.b = s.bucket
  LEFT JOIN r ON r.b = s.bucket
  LEFT JOIN v ON v.b = s.bucket
  ORDER BY s.bucket;
END;
$$;

-- 3. Recent activity functions
CREATE OR REPLACE FUNCTION public.supplier_recent_leads(
  _supplier_id uuid,
  _limit int DEFAULT 10
) RETURNS TABLE(
  id uuid,
  name text,
  contact_email text,
  source text,
  status text,
  priority text,
  created_at timestamptz,
  last_contact_date timestamptz,
  sla_risk boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_exists boolean;
BEGIN
  -- Authorization check
  SELECT EXISTS (
    SELECT 1 
    FROM companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.contact_email,
    l.source,
    l.status,
    l.priority,
    l.created_at,
    l.last_contact_date,
    -- SLA risk: new leads not contacted within 24 hours
    (l.status = 'new' AND l.created_at < now() - interval '24 hours') AS sla_risk
  FROM leads l
  WHERE l.supplier_id = _supplier_id
  ORDER BY l.created_at DESC
  LIMIT _limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.supplier_recent_orders(
  _supplier_id uuid,
  _limit int DEFAULT 10
) RETURNS TABLE(
  id uuid,
  title text,
  status text,
  amount numeric,
  due_date date,
  created_at timestamptz,
  client_name text,
  unread_messages int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_exists boolean;
BEGIN
  -- Authorization check
  SELECT EXISTS (
    SELECT 1 
    FROM companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    o.status::text,
    o.amount,
    o.due_date,
    o.created_at,
    p.full_name AS client_name,
    COALESCE((
      SELECT count(*)::int
      FROM messages m
      WHERE m.order_id = o.id 
        AND m.recipient_id = _supplier_id
        AND m.read_at IS NULL
    ), 0) AS unread_messages
  FROM orders o
  LEFT JOIN profiles p ON p.id = o.client_id
  WHERE o.supplier_id = _supplier_id
  ORDER BY o.created_at DESC
  LIMIT _limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.supplier_recent_reviews(
  _supplier_id uuid,
  _limit int DEFAULT 10
) RETURNS TABLE(
  id uuid,
  rating int,
  title text,
  content text,
  created_at timestamptz,
  reviewer_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_exists boolean;
BEGIN
  -- Authorization check
  SELECT EXISTS (
    SELECT 1 
    FROM companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.rating,
    r.title,
    r.content,
    r.created_at,
    p.full_name AS reviewer_name
  FROM reviews r
  LEFT JOIN profiles p ON p.id = r.reviewer_id
  WHERE r.reviewed_id = _supplier_id
  ORDER BY r.created_at DESC
  LIMIT _limit;
END;
$$;

-- Grant permissions to authenticated users
REVOKE ALL ON FUNCTION public.supplier_dashboard_metrics(uuid, timestamptz, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.supplier_dashboard_metrics(uuid, timestamptz, timestamptz) TO authenticated;

REVOKE ALL ON FUNCTION public.supplier_timeseries(uuid, timestamptz, timestamptz, text) FROM public;
GRANT EXECUTE ON FUNCTION public.supplier_timeseries(uuid, timestamptz, timestamptz, text) TO authenticated;

REVOKE ALL ON FUNCTION public.supplier_recent_leads(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.supplier_recent_leads(uuid, int) TO authenticated;

REVOKE ALL ON FUNCTION public.supplier_recent_orders(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.supplier_recent_orders(uuid, int) TO authenticated;

REVOKE ALL ON FUNCTION public.supplier_recent_reviews(uuid, int) FROM public;
GRANT EXECUTE ON FUNCTION public.supplier_recent_reviews(uuid, int) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_supplier_created ON leads(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_supplier_status ON leads(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_created ON orders(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_status ON orders(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_created ON quotes(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier_status ON quotes(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_created ON reviews(reviewed_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_order_recipient ON messages(order_id, recipient_id) WHERE read_at IS NULL;