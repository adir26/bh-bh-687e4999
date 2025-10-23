-- ============================================
-- טבלת אירועים קלילה לאנליטיקה
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('client','supplier','admin')),
  event_name text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_events_time ON public.app_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_user_time ON public.app_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_time ON public.app_events (event_name, occurred_at DESC);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- RLS: משתמשים יכולים לכתוב אירועים עבור עצמם
CREATE POLICY app_events_write_self ON public.app_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS: אדמין יכול לקרוא הכל
CREATE POLICY app_events_admin_read ON public.app_events
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- עדכון KPI Daily (החלפת view בטבלה)
-- ============================================
DROP VIEW IF EXISTS public.kpi_daily CASCADE;

CREATE TABLE IF NOT EXISTS public.kpi_daily_new (
  d date PRIMARY KEY,
  signups_total int NOT NULL DEFAULT 0,
  signups_suppliers int NOT NULL DEFAULT 0,
  signups_customers int NOT NULL DEFAULT 0,
  dau int NOT NULL DEFAULT 0,
  wau int NOT NULL DEFAULT 0,
  mau int NOT NULL DEFAULT 0
);

-- העתקת נתונים ישנים אם יש
INSERT INTO public.kpi_daily_new (d, signups_total, signups_suppliers, signups_customers, dau, wau, mau)
SELECT 
  CURRENT_DATE as d,
  COALESCE((SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE), 0),
  COALESCE((SELECT COUNT(*) FROM profiles WHERE role = 'supplier' AND DATE(created_at) = CURRENT_DATE), 0),
  COALESCE((SELECT COUNT(*) FROM profiles WHERE role = 'client' AND DATE(created_at) = CURRENT_DATE), 0),
  0, 0, 0
ON CONFLICT (d) DO NOTHING;

-- החלפת הטבלה
ALTER TABLE public.kpi_daily_new RENAME TO kpi_daily;

-- ============================================
-- פונקציה למילוי KPI יומי
-- ============================================
CREATE OR REPLACE FUNCTION public.refresh_kpi_daily(p_date date DEFAULT CURRENT_DATE)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH signups AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE p.role='supplier') AS suppliers,
      COUNT(*) FILTER (WHERE p.role='client') AS customers
    FROM public.profiles p
    WHERE DATE(p.created_at) = p_date
  ),
  dau AS (
    SELECT COUNT(DISTINCT user_id) AS cnt
    FROM public.app_events
    WHERE DATE(occurred_at) = p_date
  ),
  wau AS (
    SELECT COUNT(DISTINCT user_id) AS cnt
    FROM public.app_events
    WHERE occurred_at >= p_date - INTERVAL '6 days'
      AND occurred_at < p_date + INTERVAL '1 day'
  ),
  mau AS (
    SELECT COUNT(DISTINCT user_id) AS cnt
    FROM public.app_events
    WHERE occurred_at >= p_date - INTERVAL '29 days'
      AND occurred_at < p_date + INTERVAL '1 day'
  )
  INSERT INTO public.kpi_daily (d, signups_total, signups_suppliers, signups_customers, dau, wau, mau)
  SELECT 
    p_date,
    COALESCE(s.total, 0),
    COALESCE(s.suppliers, 0),
    COALESCE(s.customers, 0),
    COALESCE(d.cnt, 0),
    COALESCE(w.cnt, 0),
    COALESCE(m.cnt, 0)
  FROM (SELECT 1) z
  LEFT JOIN signups s ON TRUE
  LEFT JOIN dau d ON TRUE
  LEFT JOIN wau w ON TRUE
  LEFT JOIN mau m ON TRUE
  ON CONFLICT (d) DO UPDATE
  SET 
    signups_total = EXCLUDED.signups_total,
    signups_suppliers = EXCLUDED.signups_suppliers,
    signups_customers = EXCLUDED.signups_customers,
    dau = EXCLUDED.dau,
    wau = EXCLUDED.wau,
    mau = EXCLUDED.mau;
END;
$$;

-- ============================================
-- RPC לאדמין לשליפת KPI
-- ============================================
CREATE OR REPLACE FUNCTION public.admin_get_kpis(p_from date, p_to date)
RETURNS TABLE (
  d date, 
  signups_total int, 
  signups_suppliers int, 
  signups_customers int, 
  dau int, 
  wau int, 
  mau int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d, signups_total, signups_suppliers, signups_customers, dau, wau, mau
  FROM public.kpi_daily
  WHERE d BETWEEN p_from AND p_to
  ORDER BY d ASC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_kpis(date, date) TO authenticated;
GRANT SELECT ON public.kpi_daily TO authenticated;