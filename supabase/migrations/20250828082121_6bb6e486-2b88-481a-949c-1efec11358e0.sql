-- Supplier Orders feature migration (fixed syntax)
-- 1) Add new columns to orders without altering existing status
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS current_status TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone_e164 TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS eta_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_ils NUMERIC(12,2);

-- Backfill current_status and total_ils where missing
UPDATE public.orders
SET current_status = COALESCE(current_status,
  CASE status::text
    WHEN 'in_progress' THEN 'in_production'
    WHEN 'completed' THEN 'delivered'
    WHEN 'cancelled' THEN 'canceled'
    ELSE status::text
  END
),
    total_ils = COALESCE(total_ils, amount)
WHERE (current_status IS NULL OR total_ils IS NULL);

-- Create CHECK constraint for current_status
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_current_status_check'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_current_status_check 
    CHECK (current_status IS NULL OR current_status IN (
      'pending','confirmed','in_production','ready','shipped','delivered','canceled','refunded'
    ));
  END IF;
END $$;

-- Create supporting tables
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  note TEXT,
  is_customer_visible BOOLEAN NOT NULL DEFAULT false,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  phone_e164 TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('answered','no_answer','voicemail','whatsapp')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_supplier_current_status ON public.orders(supplier_id, current_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_closed_at ON public.orders(closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id ON public.order_status_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- RPC helpers with server-side validation
CREATE OR REPLACE FUNCTION public.rpc_supplier_can_access(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id
      AND (
        o.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.rpc_update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_is_customer_visible BOOLEAN DEFAULT false,
  p_changed_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(success BOOLEAN, message TEXT, updated_order public.orders)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_allowed TEXT[];
  v_updated public.orders;
BEGIN
  IF NOT public.rpc_supplier_can_access(p_order_id) THEN
    RETURN QUERY SELECT false, 'אין הרשאה לעדכן הזמנה זו'::TEXT, NULL::public.orders;
    RETURN;
  END IF;

  SELECT current_status INTO v_current_status FROM public.orders WHERE id = p_order_id;
  IF v_current_status IS NULL THEN
    SELECT CASE status::text
      WHEN 'in_progress' THEN 'in_production'
      WHEN 'completed' THEN 'delivered'
      WHEN 'cancelled' THEN 'canceled'
      ELSE status::text
    END INTO v_current_status
    FROM public.orders WHERE id = p_order_id;
  END IF;

  v_allowed := CASE v_current_status
    WHEN 'pending' THEN ARRAY['confirmed','canceled']
    WHEN 'confirmed' THEN ARRAY['in_production','canceled']
    WHEN 'in_production' THEN ARRAY['ready','canceled']
    WHEN 'ready' THEN ARRAY['shipped','delivered','canceled']
    WHEN 'shipped' THEN ARRAY['delivered','refunded','canceled']
    ELSE ARRAY['canceled']
  END;

  IF p_new_status <> v_current_status AND NOT (p_new_status = ANY(v_allowed)) THEN
    RETURN QUERY SELECT false, 'מעבר סטטוס לא מורשה'::TEXT, NULL::public.orders;
    RETURN;
  END IF;

  UPDATE public.orders SET
    current_status = p_new_status,
    closed_at = CASE WHEN p_new_status IN ('delivered','canceled','refunded') THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_updated;

  INSERT INTO public.order_status_events(order_id, old_status, new_status, reason, is_customer_visible, changed_by)
  VALUES (p_order_id, v_current_status, p_new_status, p_reason, p_is_customer_visible, p_changed_by);

  RETURN QUERY SELECT true, 'סטטוס עודכן בהצלחה'::TEXT, v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_log_call(
  p_order_id UUID,
  p_phone_e164 TEXT,
  p_outcome TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.rpc_supplier_can_access(p_order_id) THEN
    RETURN false;
  END IF;

  INSERT INTO public.order_calls(order_id, phone_e164, outcome, note)
  VALUES (p_order_id, p_phone_e164, p_outcome, p_note);

  INSERT INTO public.order_status_events(order_id, old_status, new_status, note, is_customer_visible, changed_by)
  SELECT o.current_status, o.current_status, 'שיחה: ' || p_outcome || COALESCE(' - ' || p_note, ''), false, auth.uid()
  FROM public.orders o WHERE o.id = p_order_id;

  RETURN true;
END;
$$;

-- Storage bucket for order attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('orders', 'orders', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_calls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "order_items_access" ON public.order_items;
DROP POLICY IF EXISTS "order_status_events_access" ON public.order_status_events;
DROP POLICY IF EXISTS "order_attachments_access" ON public.order_attachments;
DROP POLICY IF EXISTS "order_calls_access" ON public.order_calls;

-- Create RLS policies  
CREATE POLICY "order_items_access" ON public.order_items
FOR ALL TO authenticated USING (public.rpc_supplier_can_access(order_id)) WITH CHECK (public.rpc_supplier_can_access(order_id));

CREATE POLICY "order_status_events_access" ON public.order_status_events
FOR ALL TO authenticated USING (public.rpc_supplier_can_access(order_id)) WITH CHECK (public.rpc_supplier_can_access(order_id));

CREATE POLICY "order_attachments_access" ON public.order_attachments
FOR ALL TO authenticated USING (public.rpc_supplier_can_access(order_id)) WITH CHECK (public.rpc_supplier_can_access(order_id));

CREATE POLICY "order_calls_access" ON public.order_calls
FOR ALL TO authenticated USING (public.rpc_supplier_can_access(order_id)) WITH CHECK (public.rpc_supplier_can_access(order_id));

-- Storage policies for orders bucket
DROP POLICY IF EXISTS "orders_files_supplier_access" ON storage.objects;
DROP POLICY IF EXISTS "orders_files_supplier_insert" ON storage.objects;
DROP POLICY IF EXISTS "orders_files_supplier_update" ON storage.objects;
DROP POLICY IF EXISTS "orders_files_supplier_delete" ON storage.objects;

CREATE POLICY "orders_files_supplier_access" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'orders' AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND (o.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
  )
);

CREATE POLICY "orders_files_supplier_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'orders' AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND (o.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
  )
);

CREATE POLICY "orders_files_supplier_update" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'orders' AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND (o.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
  )
);

CREATE POLICY "orders_files_supplier_delete" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'orders' AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND (o.supplier_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
  )
);

-- Realtime setup
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_events;