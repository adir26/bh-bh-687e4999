CREATE OR REPLACE FUNCTION public.get_supplier_dashboard_data(
  _supplier_id UUID,
  _from TIMESTAMP WITH TIME ZONE,
  _to TIMESTAMP WITH TIME ZONE,
  _recent_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_metrics JSONB;
  v_recent_leads JSONB;
  v_recent_orders JSONB;
  v_recent_reviews JSONB;
  company_exists BOOLEAN;
BEGIN
  -- Authorization check
  SELECT EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.owner_id = auth.uid() AND c.id = _supplier_id
  ) INTO company_exists;
  
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.id = _supplier_id AND p.role = 'supplier'
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
      SELECT count(*) FROM leads 
      WHERE supplier_id = _supplier_id 
        AND status IN ('new', 'contacted', 'proposal_sent')
        AND created_at < _to
    ),
    'lead_conversion_rate', (
      CASE 
        WHEN (SELECT count(*) FROM lead_base) > 0 THEN
          ROUND((SELECT count(*) FROM order_base WHERE status <> 'cancelled')::NUMERIC / 
                (SELECT count(*) FROM lead_base)::NUMERIC * 100, 2)
        ELSE 0
      END
    ),
    'quotes_sent', (SELECT count(*) FROM quote_base),
    'quotes_accepted', (
      SELECT count(*) FROM quotes 
      WHERE supplier_id = _supplier_id 
        AND status = 'accepted'
        AND sent_at >= _from AND sent_at < _to
    ),
    'orders_active', (
      SELECT count(*) FROM orders 
      WHERE supplier_id = _supplier_id 
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND created_at < _to
    ),
    'orders_completed', (SELECT count(*) FROM order_base WHERE status = 'completed'),
    'revenue', COALESCE((
      SELECT sum(amount) FROM order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'aov', COALESCE((
      SELECT ROUND(avg(amount), 2) FROM order_base WHERE status = 'completed'
    ), 0),
    'rating_avg', COALESCE((SELECT ROUND(avg(rating), 1) FROM review_base), 0),
    'reviews_count', (SELECT count(*) FROM review_base),
    'avg_response_time_hours', (
      SELECT COALESCE(
        ROUND(AVG(EXTRACT(EPOCH FROM (last_contact_date - created_at)) / 3600)::NUMERIC, 1), 0
      )
      FROM lead_base WHERE last_contact_date IS NOT NULL
    ),
    'prev_revenue', COALESCE((
      SELECT sum(amount) FROM prev_order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'prev_orders_completed', (
      SELECT count(*) FROM prev_order_base WHERE status = 'completed'
    )
  ) INTO v_metrics;

  -- Get recent leads
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', l.id,
      'name', l.name,
      'contact_email', l.contact_email,
      'source', l.source,
      'status', l.status,
      'priority', l.priority,
      'created_at', l.created_at,
      'last_contact_date', l.last_contact_date,
      'sla_risk', (l.status = 'new' AND l.created_at < now() - interval '24 hours')
    )
  )
  FROM (
    SELECT * FROM leads 
    WHERE supplier_id = _supplier_id
    ORDER BY created_at DESC
    LIMIT _recent_limit
  ) l INTO v_recent_leads;

  -- Get recent orders
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'title', o.title,
      'status', o.status,
      'amount', o.amount,
      'due_date', o.due_date,
      'created_at', o.created_at,
      'client_name', p.full_name,
      'unread_messages', (
        SELECT count(*) FROM messages m
        WHERE m.order_id = o.id 
          AND m.recipient_id = _supplier_id
          AND m.read_at IS NULL
      )
    )
  )
  FROM (
    SELECT * FROM orders 
    WHERE supplier_id = _supplier_id
    ORDER BY created_at DESC
    LIMIT _recent_limit
  ) o
  LEFT JOIN profiles p ON p.id = o.client_id
  INTO v_recent_orders;

  -- Get recent reviews
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'rating', r.rating,
      'title', r.title,
      'content', r.content,
      'created_at', r.created_at,
      'reviewer_name', p.full_name
    )
  )
  FROM (
    SELECT * FROM reviews 
    WHERE reviewed_id = _supplier_id
    ORDER BY created_at DESC
    LIMIT _recent_limit
  ) r
  LEFT JOIN profiles p ON p.id = r.reviewer_id
  INTO v_recent_reviews;

  -- Combine all data
  v_result := jsonb_build_object(
    'metrics', v_metrics,
    'recent_leads', COALESCE(v_recent_leads, '[]'::jsonb),
    'recent_orders', COALESCE(v_recent_orders, '[]'::jsonb),
    'recent_reviews', COALESCE(v_recent_reviews, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;