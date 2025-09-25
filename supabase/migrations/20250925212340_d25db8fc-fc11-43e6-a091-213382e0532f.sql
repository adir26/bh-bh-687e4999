-- Create budget management tables
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  client_id UUID NOT NULL,
  total_planned NUMERIC NOT NULL DEFAULT 0,
  total_committed NUMERIC NOT NULL DEFAULT 0,
  total_actual NUMERIC NOT NULL DEFAULT 0,
  variance NUMERIC NOT NULL DEFAULT 0,
  imported_from_quote_id UUID,
  imported_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  committed_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  variance_amount NUMERIC NOT NULL DEFAULT 0,
  variance_percentage NUMERIC NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.budget_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  reference_type TEXT NOT NULL, -- 'quote', 'change_order', 'payment', 'manual'
  reference_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_type TEXT NOT NULL -- 'planned', 'committed', 'actual'
);

-- Add indexes for performance
CREATE INDEX idx_budgets_order_id ON public.budgets(order_id);
CREATE INDEX idx_budgets_supplier_id ON public.budgets(supplier_id);
CREATE INDEX idx_budget_categories_budget_id ON public.budget_categories(budget_id);
CREATE INDEX idx_budget_transactions_budget_id ON public.budget_transactions(budget_id);
CREATE INDEX idx_budget_transactions_category_id ON public.budget_transactions(category_id);
CREATE INDEX idx_budget_transactions_reference ON public.budget_transactions(reference_type, reference_id);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_transactions ENABLE ROW LEVEL SECURITY;

-- Budget RLS policies
CREATE POLICY "Suppliers can manage their order budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = supplier_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can view their order budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = supplier_id OR get_user_role(auth.uid()) = 'admin');

-- Budget Categories RLS policies  
CREATE POLICY "Budget categories follow budget permissions"
  ON public.budget_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_categories.budget_id 
    AND (b.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

CREATE POLICY "Clients can view budget categories"
  ON public.budget_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_categories.budget_id 
    AND (b.client_id = auth.uid() OR b.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

-- Budget Transactions RLS policies
CREATE POLICY "Budget transactions follow budget permissions"
  ON public.budget_transactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_transactions.budget_id 
    AND (b.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

CREATE POLICY "Clients can view budget transactions"
  ON public.budget_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_transactions.budget_id 
    AND (b.client_id = auth.uid() OR b.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
  ));

-- Triggers for updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recalculate budget totals
CREATE OR REPLACE FUNCTION public.recalculate_budget_totals(p_budget_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update category totals and variances
  UPDATE public.budget_categories
  SET 
    variance_amount = committed_amount - planned_amount,
    variance_percentage = CASE 
      WHEN planned_amount > 0 THEN 
        ROUND(((committed_amount - planned_amount) / planned_amount * 100)::numeric, 2)
      ELSE 0 
    END,
    updated_at = now()
  WHERE budget_id = p_budget_id;
  
  -- Update budget totals
  UPDATE public.budgets
  SET 
    total_planned = COALESCE((
      SELECT SUM(planned_amount) FROM public.budget_categories 
      WHERE budget_id = p_budget_id
    ), 0),
    total_committed = COALESCE((
      SELECT SUM(committed_amount) FROM public.budget_categories 
      WHERE budget_id = p_budget_id
    ), 0),
    total_actual = COALESCE((
      SELECT SUM(actual_amount) FROM public.budget_categories 
      WHERE budget_id = p_budget_id
    ), 0),
    updated_at = now()
  WHERE id = p_budget_id;
  
  -- Update overall variance
  UPDATE public.budgets
  SET variance = total_committed - total_planned
  WHERE id = p_budget_id;
END;
$$;

-- Function to import budget from quote
CREATE OR REPLACE FUNCTION public.import_budget_from_quote(
  p_order_id UUID,
  p_quote_id UUID,
  p_supplier_id UUID,
  p_client_id UUID
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget_id UUID;
  v_quote_record RECORD;
  v_category_id UUID;
BEGIN
  -- Create budget record
  INSERT INTO public.budgets (
    order_id, supplier_id, client_id, imported_from_quote_id, imported_at
  ) VALUES (
    p_order_id, p_supplier_id, p_client_id, p_quote_id, now()
  ) RETURNING id INTO v_budget_id;
  
  -- Get quote details
  SELECT total_amount INTO v_quote_record
  FROM public.quotes 
  WHERE id = p_quote_id;
  
  -- Create default categories with quote items
  -- Labor category
  INSERT INTO public.budget_categories (
    budget_id, name, description, planned_amount, display_order
  ) VALUES (
    v_budget_id, 'Labor', 'Labor costs and services', 
    COALESCE(v_quote_record.total_amount * 0.4, 0), 1
  ) RETURNING id INTO v_category_id;
  
  -- Materials category  
  INSERT INTO public.budget_categories (
    budget_id, name, description, planned_amount, display_order
  ) VALUES (
    v_budget_id, 'Materials', 'Materials and supplies',
    COALESCE(v_quote_record.total_amount * 0.45, 0), 2
  ) RETURNING id INTO v_category_id;
  
  -- Other/Contingency category
  INSERT INTO public.budget_categories (
    budget_id, name, description, planned_amount, display_order
  ) VALUES (
    v_budget_id, 'Other & Contingency', 'Miscellaneous costs and contingency',
    COALESCE(v_quote_record.total_amount * 0.15, 0), 3
  ) RETURNING id INTO v_category_id;
  
  -- Add initial transaction record
  INSERT INTO public.budget_transactions (
    budget_id, category_id, amount, description, 
    reference_type, reference_id, created_by, transaction_type
  ) VALUES (
    v_budget_id, v_category_id, v_quote_record.total_amount,
    'Initial budget imported from quote',
    'quote', p_quote_id, p_supplier_id, 'planned'
  );
  
  -- Recalculate totals
  PERFORM public.recalculate_budget_totals(v_budget_id);
  
  RETURN v_budget_id;
END;
$$;

-- Function to apply change order to budget
CREATE OR REPLACE FUNCTION public.apply_change_order_to_budget(
  p_budget_id UUID,
  p_change_order_id UUID,
  p_category_id UUID,
  p_amount NUMERIC
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update category committed amount
  UPDATE public.budget_categories
  SET 
    committed_amount = committed_amount + p_amount,
    updated_at = now()
  WHERE id = p_category_id;
  
  -- Add transaction record
  INSERT INTO public.budget_transactions (
    budget_id, category_id, amount, description,
    reference_type, reference_id, created_by, transaction_type
  ) VALUES (
    p_budget_id, p_category_id, p_amount,
    'Change order applied to budget',
    'change_order', p_change_order_id, auth.uid(), 'committed'
  );
  
  -- Recalculate totals
  PERFORM public.recalculate_budget_totals(p_budget_id);
END;
$$;

-- Function to record payment as actual
CREATE OR REPLACE FUNCTION public.record_payment_actual(
  p_budget_id UUID,
  p_payment_link_id UUID,
  p_category_id UUID,
  p_amount NUMERIC
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update category actual amount
  UPDATE public.budget_categories
  SET 
    actual_amount = actual_amount + p_amount,
    updated_at = now()
  WHERE id = p_category_id;
  
  -- Add transaction record
  INSERT INTO public.budget_transactions (
    budget_id, category_id, amount, description,
    reference_type, reference_id, created_by, transaction_type
  ) VALUES (
    p_budget_id, p_category_id, p_amount,
    'Payment recorded as actual cost',
    'payment', p_payment_link_id, auth.uid(), 'actual'
  );
  
  -- Recalculate totals
  PERFORM public.recalculate_budget_totals(p_budget_id);
END;
$$;