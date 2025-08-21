-- Phase 1: Database Schema Enhancements for Admin Customer/Lead/Order Management

-- 1.1 Customer Management Schema
-- Add blocking fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS blocked_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS block_reason text;

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id),
  entity_type text NOT NULL,  -- 'profile'|'complaint'|'lead'|'order'|...
  entity_id uuid NOT NULL,
  action text NOT NULL,       -- 'block'|'unblock'|'status_update'|'refund'|...
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enhance support_tickets for complaint management
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES public.profiles(id);

-- 1.2 Lead Management Schema
-- Lead status history table
CREATE TABLE IF NOT EXISTS public.lead_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status text,
  to_status text,
  changed_by uuid REFERENCES public.profiles(id),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Trigger to auto-log lead status changes
CREATE OR REPLACE FUNCTION public.tg_lead_status_history()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.lead_history(lead_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_lead_status_history ON public.leads;
CREATE TRIGGER trg_lead_status_history
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.tg_lead_status_history();

-- RPC for bulk lead assignment
CREATE OR REPLACE FUNCTION public.admin_assign_leads(_lead_ids uuid[], _supplier_id uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  -- Guard: Check admin role
  IF public.get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;
  
  UPDATE public.leads 
  SET supplier_id = _supplier_id, 
      assigned_to = _supplier_id,
      updated_at = now()
  WHERE id = ANY(_lead_ids);
  
  RETURN (SELECT count(*)::int FROM public.leads WHERE id = ANY(_lead_ids));
END$$;

-- RPC for bulk lead status update
CREATE OR REPLACE FUNCTION public.admin_update_lead_status(_lead_ids uuid[], _status text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  -- Guard: Check admin role
  IF public.get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;
  
  UPDATE public.leads 
  SET status = _status,
      updated_at = now()
  WHERE id = ANY(_lead_ids);
  
  RETURN (SELECT count(*)::int FROM public.leads WHERE id = ANY(_lead_ids));
END$$;

-- RPC for merging duplicate leads
CREATE OR REPLACE FUNCTION public.admin_merge_leads(_primary_id uuid, _duplicate_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  -- Guard: Check admin role
  IF public.get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;
  
  -- Move lead activities to primary lead
  UPDATE public.lead_activities 
  SET lead_id = _primary_id 
  WHERE lead_id = ANY(_duplicate_ids);
  
  -- Log merge action
  INSERT INTO public.admin_audit_logs(admin_id, entity_type, entity_id, action, metadata)
  VALUES (auth.uid(), 'lead', _primary_id, 'merge_leads', 
          jsonb_build_object('merged_ids', _duplicate_ids));
  
  -- Delete duplicate leads
  DELETE FROM public.leads WHERE id = ANY(_duplicate_ids);
END$$;

-- 1.3 Order Management Schema
-- Add payment status and order numbers to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_status text CHECK (payment_status IN ('unpaid','paid','partial','refunded')) DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS refunded_total numeric DEFAULT 0;

-- Generate order numbers for existing orders without them
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current year and month
    SELECT TO_CHAR(NOW(), 'YYYYMM') INTO new_number;
    
    -- Get the count of orders this month
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.orders 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Format: YYYYMM-O-NNNN (e.g., 202401-O-0001)
    new_number := new_number || '-O-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END$$;

-- Trigger to set order number on insert
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_set_order_number ON public.orders;
CREATE TRIGGER trg_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- Create refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  reason text,
  processed_by uuid REFERENCES public.profiles(id),
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RPC for processing refunds
CREATE OR REPLACE FUNCTION public.admin_refund_order(_order_id uuid, _amount numeric, _reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE 
  rid uuid;
  order_total numeric;
  current_refunded numeric;
BEGIN
  -- Guard: Check admin role
  IF public.get_user_role(auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;
  
  -- Get order details
  SELECT amount, COALESCE(refunded_total, 0)
  INTO order_total, current_refunded
  FROM public.orders 
  WHERE id = _order_id;
  
  IF order_total IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF current_refunded + _amount > order_total THEN
    RAISE EXCEPTION 'Refund amount exceeds order total';
  END IF;
  
  -- Insert refund record
  INSERT INTO public.refunds(order_id, amount, reason, processed_by)
  VALUES (_order_id, _amount, _reason, auth.uid())
  RETURNING id INTO rid;

  -- Update order refund status
  UPDATE public.orders
  SET refunded_total = COALESCE(refunded_total, 0) + _amount,
      payment_status = CASE 
        WHEN COALESCE(refunded_total, 0) + _amount >= amount THEN 'refunded'
        WHEN COALESCE(refunded_total, 0) + _amount > 0 THEN 'partial'
        ELSE payment_status
      END,
      updated_at = now()
  WHERE id = _order_id;

  -- Log refund action
  INSERT INTO public.admin_audit_logs(admin_id, entity_type, entity_id, action, metadata)
  VALUES (auth.uid(), 'order', _order_id, 'refund', 
          jsonb_build_object('amount', _amount, 'reason', _reason, 'refund_id', rid));

  RETURN rid;
END$$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email_search ON public.profiles USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created ON public.support_tickets(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_supplier_created ON public.leads(supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_refunds_order_processed ON public.refunds(order_id, processed_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id, created_at);

-- Enable RLS on new tables
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin audit logs
CREATE POLICY "Admin full access to audit logs" 
ON public.admin_audit_logs 
FOR ALL 
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for lead history
CREATE POLICY "Lead history follows lead permissions"
ON public.lead_history
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_history.lead_id
    AND (
      leads.client_id = auth.uid() OR
      leads.supplier_id = auth.uid() OR
      leads.assigned_to = auth.uid() OR
      public.get_user_role(auth.uid()) = 'admin'
    )
  )
);

-- RLS Policies for refunds
CREATE POLICY "Refunds follow order permissions"
ON public.refunds
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = refunds.order_id
    AND (
      orders.client_id = auth.uid() OR
      orders.supplier_id = auth.uid() OR
      public.get_user_role(auth.uid()) = 'admin'
    )
  )
);

-- Update profiles RLS to allow admin read/write for blocking
CREATE POLICY "Admin can manage profile blocking"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');