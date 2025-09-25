-- Create selections feature tables
CREATE TABLE public.selection_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  allowance_amount NUMERIC DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.selection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.selection_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  sku TEXT,
  vendor_info JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.selection_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.selection_groups(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  client_id UUID NOT NULL,
  selected_items JSONB NOT NULL DEFAULT '[]', -- Array of selected item IDs
  total_amount NUMERIC NOT NULL DEFAULT 0,
  allowance_amount NUMERIC NOT NULL DEFAULT 0,
  over_allowance_amount NUMERIC NOT NULL DEFAULT 0,
  approval_token TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.selection_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.selection_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal supplier notes vs client-visible comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_selection_groups_order_id ON public.selection_groups(order_id);
CREATE INDEX idx_selection_groups_supplier_id ON public.selection_groups(supplier_id);
CREATE INDEX idx_selection_items_group_id ON public.selection_items(group_id);
CREATE INDEX idx_selection_approvals_order_id ON public.selection_approvals(order_id);
CREATE INDEX idx_selection_approvals_token ON public.selection_approvals(approval_token);
CREATE INDEX idx_selection_comments_group_id ON public.selection_comments(group_id);

-- RLS Policies
ALTER TABLE public.selection_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_comments ENABLE ROW LEVEL SECURITY;

-- Selection Groups RLS
CREATE POLICY "Suppliers can manage their selection groups"
  ON public.selection_groups FOR ALL
  USING (auth.uid() = supplier_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view selection groups for their orders"
  ON public.selection_groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND o.client_id = auth.uid()
  ));

-- Selection Items RLS
CREATE POLICY "Selection items follow group permissions"
  ON public.selection_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.selection_groups sg 
    WHERE sg.id = group_id 
    AND (sg.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

CREATE POLICY "Clients can view selection items for their orders"
  ON public.selection_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.selection_groups sg
    JOIN public.orders o ON o.id = sg.order_id
    WHERE sg.id = group_id AND o.client_id = auth.uid()
  ));

-- Selection Approvals RLS
CREATE POLICY "Suppliers can view their selection approvals"
  ON public.selection_approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.selection_groups sg 
    WHERE sg.id = group_id 
    AND (sg.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

CREATE POLICY "Clients can manage their selection approvals"
  ON public.selection_approvals FOR ALL
  USING (auth.uid() = client_id OR EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND o.client_id = auth.uid()
  ));

CREATE POLICY "Anyone can view selection approvals with valid token"
  ON public.selection_approvals FOR SELECT
  USING (true); -- Token validation happens in application layer

-- Selection Comments RLS
CREATE POLICY "Selection comments follow group permissions"
  ON public.selection_comments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.selection_groups sg 
    WHERE sg.id = group_id 
    AND (sg.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin' OR 
         EXISTS (SELECT 1 FROM public.orders o WHERE o.id = sg.order_id AND o.client_id = auth.uid()))
  ));

-- Triggers for updated_at
CREATE TRIGGER update_selection_groups_updated_at
  BEFORE UPDATE ON public.selection_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_selection_approvals_updated_at
  BEFORE UPDATE ON public.selection_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate selection totals and allowances
CREATE OR REPLACE FUNCTION public.calculate_selection_totals(p_group_id UUID, p_selected_items JSONB)
RETURNS JSONB AS $$
DECLARE
  v_total_amount NUMERIC := 0;
  v_allowance_amount NUMERIC := 0;
  v_over_allowance_amount NUMERIC := 0;
  v_item JSONB;
BEGIN
  -- Get group allowance
  SELECT allowance_amount INTO v_allowance_amount
  FROM public.selection_groups 
  WHERE id = p_group_id;
  
  -- Calculate total of selected items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_selected_items)
  LOOP
    v_total_amount := v_total_amount + COALESCE((
      SELECT price FROM public.selection_items 
      WHERE id = (v_item->>'id')::UUID
    ), 0);
  END LOOP;
  
  -- Calculate over allowance
  v_over_allowance_amount := GREATEST(0, v_total_amount - v_allowance_amount);
  
  RETURN jsonb_build_object(
    'total_amount', v_total_amount,
    'allowance_amount', v_allowance_amount,
    'over_allowance_amount', v_over_allowance_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve selections and update order
CREATE OR REPLACE FUNCTION public.approve_selections(
  p_approval_token TEXT,
  p_selected_items JSONB,
  p_client_signature TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_approval_id UUID;
  v_group_id UUID;
  v_order_id UUID;
  v_client_id UUID;
  v_totals JSONB;
BEGIN
  -- Validate token and get approval info
  SELECT id, group_id, order_id, client_id
  INTO v_approval_id, v_group_id, v_order_id, v_client_id
  FROM public.selection_approvals
  WHERE approval_token = p_approval_token
    AND approved_at IS NULL
    AND expires_at > now();
  
  IF v_approval_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired approval token';
  END IF;
  
  -- Calculate totals
  v_totals := public.calculate_selection_totals(v_group_id, p_selected_items);
  
  -- Update approval record
  UPDATE public.selection_approvals
  SET 
    selected_items = p_selected_items,
    total_amount = (v_totals->>'total_amount')::NUMERIC,
    allowance_amount = (v_totals->>'allowance_amount')::NUMERIC,
    over_allowance_amount = (v_totals->>'over_allowance_amount')::NUMERIC,
    approved_at = now(),
    approved_by = v_client_id,
    updated_at = now()
  WHERE id = v_approval_id;
  
  -- Log order event
  INSERT INTO public.order_events (order_id, actor_id, event_type, meta)
  VALUES (
    v_order_id, 
    v_client_id, 
    'selections_approved',
    jsonb_build_object(
      'group_id', v_group_id,
      'selected_items', p_selected_items,
      'total_amount', v_totals->>'total_amount',
      'over_allowance_amount', v_totals->>'over_allowance_amount'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', v_approval_id,
    'totals', v_totals
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;