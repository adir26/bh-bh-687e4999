-- Create change orders tables
CREATE TABLE public.change_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  client_id UUID NOT NULL,
  co_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  time_delta_days INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'cancelled')),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.change_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_order_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('addition', 'removal', 'modification')),
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  line_total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.change_order_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_order_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_order_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for change_orders
CREATE POLICY "Suppliers can manage their change orders"
ON public.change_orders
FOR ALL
USING (
  auth.uid() = supplier_id OR 
  auth.uid() = created_by OR 
  get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Clients can view change orders for their orders"
ON public.change_orders
FOR SELECT
USING (
  auth.uid() = client_id OR 
  auth.uid() = supplier_id OR 
  get_user_role(auth.uid()) = 'admin'
);

-- RLS Policies for change_order_items
CREATE POLICY "Change order items follow parent permissions"
ON public.change_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.change_orders co
    WHERE co.id = change_order_items.change_order_id
    AND (
      auth.uid() = co.supplier_id OR 
      auth.uid() = co.client_id OR 
      auth.uid() = co.created_by OR
      get_user_role(auth.uid()) = 'admin'
    )
  )
);

-- RLS Policies for change_order_events
CREATE POLICY "Change order events follow parent permissions"
ON public.change_order_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.change_orders co
    WHERE co.id = change_order_events.change_order_id
    AND (
      auth.uid() = co.supplier_id OR 
      auth.uid() = co.client_id OR 
      auth.uid() = co.created_by OR
      get_user_role(auth.uid()) = 'admin'
    )
  )
);

-- Function to generate CO numbers
CREATE OR REPLACE FUNCTION public.generate_co_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current year
    SELECT TO_CHAR(NOW(), 'YYYY') INTO new_number;
    
    -- Get the count of change orders this year
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.change_orders 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Format: YYYY-CO-NNNN (e.g., 2024-CO-0001)
    new_number := new_number || '-CO-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$;

-- Trigger to set CO number
CREATE OR REPLACE FUNCTION public.set_co_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.co_number IS NULL OR NEW.co_number = '' THEN
        NEW.co_number := public.generate_co_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_change_order_number
BEFORE INSERT ON public.change_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_co_number();

-- Trigger for updated_at
CREATE TRIGGER update_change_orders_updated_at
BEFORE UPDATE ON public.change_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update order totals when change order is approved
CREATE OR REPLACE FUNCTION public.approve_change_order(p_change_order_id UUID, p_approver_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_co RECORD;
  v_order RECORD;
  v_new_total NUMERIC;
  v_new_due_date DATE;
BEGIN
  -- Get change order details
  SELECT * INTO v_co
  FROM public.change_orders
  WHERE id = p_change_order_id
  AND status = 'pending_approval';
  
  IF v_co.id IS NULL THEN
    RAISE EXCEPTION 'Change order not found or not pending approval';
  END IF;
  
  -- Get current order
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = v_co.order_id;
  
  -- Calculate new totals
  v_new_total := v_order.amount + v_co.total_amount;
  v_new_due_date := COALESCE(v_order.due_date, CURRENT_DATE) + v_co.time_delta_days;
  
  -- Update change order status
  UPDATE public.change_orders
  SET status = 'approved',
      approved_at = now(),
      approved_by = p_approver_id
  WHERE id = p_change_order_id;
  
  -- Update original order
  UPDATE public.orders
  SET amount = v_new_total,
      due_date = v_new_due_date,
      updated_at = now()
  WHERE id = v_co.order_id;
  
  -- Log events
  INSERT INTO public.change_order_events (change_order_id, event_type, actor_id, metadata)
  VALUES (p_change_order_id, 'approved', p_approver_id, jsonb_build_object(
    'previous_amount', v_order.amount,
    'new_amount', v_new_total,
    'previous_due_date', v_order.due_date,
    'new_due_date', v_new_due_date
  ));
  
  INSERT INTO public.order_events (order_id, event_type, actor_id, meta)
  VALUES (v_co.order_id, 'change_order_approved', p_approver_id, jsonb_build_object(
    'change_order_id', p_change_order_id,
    'co_number', v_co.co_number,
    'amount_delta', v_co.total_amount,
    'time_delta_days', v_co.time_delta_days
  ));
  
  RETURN jsonb_build_object(
    'success', true,
    'change_order_id', p_change_order_id,
    'new_order_total', v_new_total,
    'new_due_date', v_new_due_date
  );
END;
$$;