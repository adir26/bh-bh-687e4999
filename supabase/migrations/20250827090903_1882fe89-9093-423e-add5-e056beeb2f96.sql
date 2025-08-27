-- Create KPI infrastructure with proper PostgreSQL syntax

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

-- Create simplified daily KPI aggregation view 
CREATE OR REPLACE VIEW public.kpi_daily AS
WITH date_series AS (
  SELECT generate_series(
    (CURRENT_DATE - INTERVAL '1 year')::date,
    CURRENT_DATE::date,
    '1 day'::interval
  )::date AS date
),
user_stats AS (
  SELECT 
    created_at::date as date,
    COUNT(*) as new_users_count,
    COUNT(CASE WHEN role = 'supplier' THEN 1 END) as new_suppliers_count
  FROM public.profiles
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'
  GROUP BY created_at::date
),
order_stats AS (
  SELECT 
    created_at::date as date,
    COUNT(*) as orders_count,
    COALESCE(SUM(amount), 0) as gmv_ils,
    COALESCE(SUM(amount * 0.05), 0) as revenue_ils
  FROM public.orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'
    AND status != 'cancelled'
  GROUP BY created_at::date
)
SELECT 
  ds.date,
  COALESCE(us.new_users_count, 0) AS new_users,
  COALESCE(us.new_suppliers_count, 0) AS new_suppliers,
  COALESCE(os.orders_count, 0) AS orders_count,
  COALESCE(os.gmv_ils, 0) AS gmv_ils,
  COALESCE(os.revenue_ils, 0) AS revenue_ils
FROM date_series ds
LEFT JOIN user_stats us ON us.date = ds.date
LEFT JOIN order_stats os ON os.date = ds.date
ORDER BY ds.date;

-- Create top suppliers view (last 30 days)
CREATE OR REPLACE VIEW public.top_suppliers_30d AS
SELECT 
  COALESCE(c.name, p.full_name, 'ספק לא ידוע') as name,
  o.supplier_id,
  COUNT(o.id) AS orders,
  COALESCE(SUM(o.amount), 0) AS gmv_ils,
  COALESCE(SUM(o.amount * 0.05), 0) AS revenue_ils
FROM public.orders o
LEFT JOIN public.companies c ON c.id = o.supplier_id
LEFT JOIN public.profiles p ON p.id = o.supplier_id AND p.role = 'supplier'
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY o.supplier_id, c.name, p.full_name
HAVING COUNT(o.id) > 0
ORDER BY gmv_ils DESC
LIMIT 20;

-- Create top categories view (last 30 days) - simplified
CREATE OR REPLACE VIEW public.top_categories_30d AS
SELECT 
  cat.name AS category_name,
  cat.id as category_id,
  0 AS orders, -- Placeholder since category-order relationship needs to be established
  0 AS gmv_ils -- Placeholder
FROM public.categories cat
WHERE cat.is_active = true
ORDER BY cat.name
LIMIT 10;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at ON public.profiles (role, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_created_at ON public.orders (supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders (status, created_at);

-- Grant necessary permissions
GRANT SELECT ON public.kpi_daily TO authenticated;
GRANT SELECT ON public.top_suppliers_30d TO authenticated;
GRANT SELECT ON public.top_categories_30d TO authenticated;