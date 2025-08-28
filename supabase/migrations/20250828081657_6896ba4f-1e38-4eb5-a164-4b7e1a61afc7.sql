-- Fix order status enum update with proper default handling
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

ALTER TYPE order_status RENAME TO order_status_old;

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'in_production',
  'ready',
  'shipped',
  'delivered',
  'canceled',
  'refunded'
);

-- Update orders table with new fields and status conversion
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_status_check,
  ADD COLUMN customer_name TEXT,
  ADD COLUMN customer_phone TEXT,
  ADD COLUMN customer_phone_e164 TEXT,
  ADD COLUMN customer_email TEXT,
  ADD COLUMN shipping_address JSONB,
  ADD COLUMN eta_at TIMESTAMPTZ,
  ADD COLUMN closed_at TIMESTAMPTZ,
  ALTER COLUMN status TYPE order_status USING 
    CASE 
      WHEN status::text = 'cancelled' THEN 'canceled'::order_status
      WHEN status::text = 'completed' THEN 'delivered'::order_status
      WHEN status::text = 'in_progress' THEN 'in_production'::order_status
      ELSE status::text::order_status
    END;

-- Restore default after type change
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'::order_status;

DROP TYPE order_status_old;

-- Create missing tables
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  note TEXT,
  is_customer_visible BOOLEAN DEFAULT false,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  phone_e164 TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('answered', 'no_answer', 'voicemail', 'whatsapp')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_supplier_status ON orders(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_closed_at ON orders(closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id ON order_status_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create RPC functions
CREATE OR REPLACE FUNCTION rpc_supplier_can_access(order_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders o
    JOIN profiles p ON p.id = auth.uid()
    WHERE o.id = order_id 
    AND (o.supplier_id = auth.uid() OR p.role = 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION rpc_update_order_status(
  order_id UUID,
  new_status TEXT,
  reason TEXT DEFAULT NULL,
  is_customer_visible BOOLEAN DEFAULT false,
  changed_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(success BOOLEAN, message TEXT, updated_order orders)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  order_record orders;
  allowed_transitions TEXT[];
BEGIN
  -- Check access
  IF NOT rpc_supplier_can_access(order_id) THEN
    RETURN QUERY SELECT false, 'אין הרשאה לעדכן הזמנה זו'::TEXT, NULL::orders;
    RETURN;
  END IF;

  -- Get current status
  SELECT status INTO current_status FROM orders WHERE id = order_id;
  
  -- Define allowed transitions
  allowed_transitions := CASE current_status
    WHEN 'pending' THEN ARRAY['confirmed', 'canceled']
    WHEN 'confirmed' THEN ARRAY['in_production', 'canceled']
    WHEN 'in_production' THEN ARRAY['ready', 'canceled']
    WHEN 'ready' THEN ARRAY['shipped', 'delivered', 'canceled']
    WHEN 'shipped' THEN ARRAY['delivered', 'refunded', 'canceled']
    ELSE ARRAY['canceled'] -- Any status can be canceled
  END;

  -- Validate transition
  IF new_status <> current_status AND NOT (new_status = ANY(allowed_transitions)) THEN
    RETURN QUERY SELECT false, 'מעבר סטטוס לא מורשה'::TEXT, NULL::orders;
    RETURN;
  END IF;

  -- Update order status
  UPDATE orders 
  SET 
    status = new_status::order_status,
    closed_at = CASE WHEN new_status IN ('delivered', 'canceled', 'refunded') THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = order_id
  RETURNING * INTO order_record;

  -- Log status change
  INSERT INTO order_status_events (order_id, old_status, new_status, reason, is_customer_visible, changed_by)
  VALUES (order_id, current_status, new_status, reason, is_customer_visible, changed_by);

  RETURN QUERY SELECT true, 'סטטוס עודכן בהצלחה'::TEXT, order_record;
END;
$$;

CREATE OR REPLACE FUNCTION rpc_log_call(
  order_id UUID,
  phone_e164 TEXT,
  outcome TEXT,
  note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Check access
  IF NOT rpc_supplier_can_access(order_id) THEN
    RETURN false;
  END IF;

  -- Insert call record
  INSERT INTO order_calls (order_id, phone_e164, outcome, note)
  VALUES (order_id, phone_e164, outcome, note);

  -- Create timeline event
  INSERT INTO order_status_events (order_id, old_status, new_status, note, is_customer_visible, changed_by)
  SELECT o.status, o.status, 'שיחה: ' || outcome || COALESCE(' - ' || note, ''), false, auth.uid()
  FROM orders o WHERE o.id = order_id;

  RETURN true;
END;
$$;

-- Create storage bucket for orders
INSERT INTO storage.buckets (id, name, public) 
VALUES ('orders', 'orders', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "order_items_access" ON order_items
  FOR ALL USING (rpc_supplier_can_access(order_id));

CREATE POLICY "order_status_events_access" ON order_status_events
  FOR ALL USING (rpc_supplier_can_access(order_id));

CREATE POLICY "order_attachments_access" ON order_attachments
  FOR ALL USING (rpc_supplier_can_access(order_id));

CREATE POLICY "order_calls_access" ON order_calls
  FOR ALL USING (rpc_supplier_can_access(order_id));

-- Storage policies for orders bucket
CREATE POLICY "orders_files_supplier_access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'orders' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for order tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_events;