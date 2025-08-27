-- Phase 1: Create KPI calculation infrastructure (FIXED)

-- Create admin audit events table for tracking filter changes
CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin audit events 
ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admin audit events
CREATE POLICY "Only admins can manage audit events" ON public.admin_audit_events
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Create daily KPI materialized view (FIXED COLUMN REFERENCES)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.kpi_daily AS
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '1 year',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS date
), 
daily_data AS (
  SELECT 
    ds.date,
    -- User metrics
    COUNT(DISTINCT CASE WHEN p.created_at::date = ds.date THEN p.id END) AS new_users,
    COUNT(DISTINCT CASE WHEN p.created_at::date <= ds.date THEN p.id END) AS total_users,
    -- Supplier metrics  
    COUNT(DISTINCT CASE WHEN p.role = 'supplier' AND p.created_at::date = ds.date THEN p.id END) AS new_suppliers,
    COUNT(DISTINCT CASE WHEN p.role = 'supplier' AND p.created_at::date <= ds.date THEN p.id END) AS total_suppliers,
    -- Order metrics
    COUNT(DISTINCT CASE WHEN o.created_at::date = ds.date THEN o.id END) AS orders_count,
    COALESCE(SUM(CASE WHEN o.created_at::date = ds.date THEN o.amount END), 0) AS gmv_ils,
    -- Assuming 5% commission as revenue
    COALESCE(SUM(CASE WHEN o.created_at::date = ds.date THEN o.amount * 0.05 END), 0) AS revenue_ils,
    -- DAU approximation (new users on that day)
    COUNT(DISTINCT CASE WHEN p.created_at::date = ds.date THEN p.id END) AS dau,
    -- MAU approximation (users created this month up to this date)
    COUNT(DISTINCT CASE WHEN p.created_at >= date_trunc('month', ds.date) AND p.created_at::date <= ds.date THEN p.id END) AS mau
  FROM date_series ds
  LEFT JOIN public.profiles p ON p.created_at::date <= ds.date
  LEFT JOIN public.orders o ON o.created_at::date = ds.date AND o.status != 'cancelled'
  GROUP BY ds.date
)
SELECT 
  date,
  COALESCE(new_users, 0) AS new_users,
  COALESCE(total_users, 0) AS total_users,
  COALESCE(new_suppliers, 0) AS new_suppliers, 
  COALESCE(total_suppliers, 0) AS total_suppliers,
  COALESCE(orders_count, 0) AS orders_count,
  COALESCE(gmv_ils, 0) AS gmv_ils,
  COALESCE(revenue_ils, 0) AS revenue_ils,
  COALESCE(dau, 0) AS dau,
  COALESCE(mau, 0) AS mau
FROM daily_data
ORDER BY date;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_kpi_daily_date ON public.kip_daily (date);

-- Create top suppliers view (last 30 days)
CREATE OR REPLACE VIEW public.top_suppliers_30d AS
SELECT 
  c.name,
  c.id as supplier_id,
  COUNT(o.id) AS orders,
  COALESCE(SUM(o.amount), 0) AS gmv_ils,
  COALESCE(SUM(o.amount * 0.05), 0) AS revenue_ils
FROM public.companies c
LEFT JOIN public.orders o ON o.supplier_id = c.id 
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
WHERE c.status = 'active'
GROUP BY c.id, c.name
ORDER BY gmv_ils DESC
LIMIT 20;

-- Create top categories view (last 30 days) - Check if company_categories table exists
CREATE OR REPLACE VIEW public.top_categories_30d AS
SELECT 
  cat.name AS category_name,
  cat.id as category_id,
  COUNT(o.id) AS orders,
  COALESCE(SUM(o.amount), 0) AS gmv_ils
FROM public.categories cat
LEFT JOIN public.orders o ON o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
WHERE cat.is_active = true
GROUP BY cat.id, cat.name
ORDER BY gmv_ils DESC
LIMIT 10;

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_kpi_materialized()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to refresh
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.kpi_daily;
END;
$$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at ON public.profiles (role, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_created_at ON public.orders (supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders (status, created_at);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies (status);

-- Grant necessary permissions
GRANT SELECT ON public.kpi_daily TO authenticated;
GRANT SELECT ON public.top_suppliers_30d TO authenticated;
GRANT SELECT ON public.top_categories_30d TO authenticated;