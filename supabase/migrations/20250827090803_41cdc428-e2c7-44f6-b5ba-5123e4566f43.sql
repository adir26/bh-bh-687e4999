-- Fix the typo and create a simpler KPI structure

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

-- Create simplified KPI daily view first
CREATE OR REPLACE VIEW public.kpi_daily AS
SELECT 
  ds.date,
  COALESCE(COUNT(DISTINCT CASE WHEN p.created_at::date = ds.date THEN p.id END), 0) AS new_users,
  COALESCE(COUNT(DISTINCT CASE WHEN p.created_at::date <= ds.date THEN p.id END), 0) AS total_users,
  COALESCE(COUNT(DISTINCT CASE WHEN p.role = 'supplier' AND p.created_at::date = ds.date THEN p.id END), 0) AS new_suppliers,
  COALESCE(COUNT(DISTINCT CASE WHEN p.role = 'supplier' AND p.created_at::date <= ds.date THEN p.id END), 0) AS total_suppliers,
  COALESCE(COUNT(DISTINCT CASE WHEN o.created_at::date = ds.date THEN o.id END), 0) AS orders_count,
  COALESCE(SUM(CASE WHEN o.created_at::date = ds.date THEN o.amount END), 0) AS gmv_ils,
  COALESCE(SUM(CASE WHEN o.created_at::date = ds.date THEN o.amount * 0.05 END), 0) AS revenue_ils
FROM generate_series(
  CURRENT_DATE - INTERVAL '1 year',
  CURRENT_DATE,
  INTERVAL '1 day'
)::date AS ds(date)
LEFT JOIN public.profiles p ON p.created_at::date <= ds.date
LEFT JOIN public.orders o ON o.created_at::date = ds.date AND o.status != 'cancelled'
GROUP BY ds.date
ORDER BY ds.date;

-- Create top suppliers view (last 30 days)
CREATE OR REPLACE VIEW public.top_suppliers_30d AS
SELECT 
  COALESCE(c.name, p.full_name) as name,
  COALESCE(c.id, p.id) as supplier_id,
  COUNT(o.id) AS orders,
  COALESCE(SUM(o.amount), 0) AS gmv_ils,
  COALESCE(SUM(o.amount * 0.05), 0) AS revenue_ils
FROM public.orders o
LEFT JOIN public.companies c ON c.id = o.supplier_id
LEFT JOIN public.profiles p ON p.id = o.supplier_id AND p.role = 'supplier'
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY c.id, c.name, p.id, p.full_name
ORDER BY gmv_ils DESC
LIMIT 20;

-- Create top categories view (last 30 days) - simplified without complex joins
CREATE OR REPLACE VIEW public.top_categories_30d AS
SELECT 
  cat.name AS category_name,
  cat.id as category_id,
  COUNT(o.id) AS orders,
  COALESCE(SUM(o.amount), 0) AS gmv_ils
FROM public.categories cat
CROSS JOIN public.orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND o.status != 'cancelled'
  AND cat.is_active = true
GROUP BY cat.id, cat.name
ORDER BY gmv_ils DESC
LIMIT 10;

-- Create function to refresh KPI data (simple version)
CREATE OR REPLACE FUNCTION public.refresh_kpi_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to refresh
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- For now, this is a placeholder for future materialized view refresh
  -- We're using views so no refresh needed
  RETURN;
END;
$$;

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