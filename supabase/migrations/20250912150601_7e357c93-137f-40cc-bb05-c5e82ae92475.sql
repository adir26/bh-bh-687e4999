-- Fix search_path security warnings for ticket functions
-- This addresses the function search path mutable warnings from the linter

-- Update generate_ticket_number function with secure search_path
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current year and month
    SELECT TO_CHAR(NOW(), 'YYYYMM') INTO new_number;
    
    -- Get the count of tickets this month
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.tickets 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Format: YYYYMM-T-NNNN (e.g., 202401-T-0001)
    new_number := new_number || '-T-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$;

-- Update set_ticket_number function with secure search_path
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Update auto_assign_ticket function with secure search_path
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    supplier_id UUID;
BEGIN
    -- Get supplier from order
    SELECT o.supplier_id INTO supplier_id
    FROM public.orders o
    WHERE o.id = NEW.order_id;
    
    -- Auto-assign to supplier and set SLA (24 hours for medium priority)
    NEW.assigned_to := supplier_id;
    NEW.sla_due_at := now() + interval '24 hours';
    
    -- Adjust SLA based on priority
    CASE NEW.priority
        WHEN 'urgent' THEN NEW.sla_due_at := now() + interval '2 hours';
        WHEN 'high' THEN NEW.sla_due_at := now() + interval '8 hours';
        WHEN 'low' THEN NEW.sla_due_at := now() + interval '72 hours';
    END CASE;
    
    RETURN NEW;
END;
$$;

-- Update escalate_overdue_tickets function with secure search_path  
CREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.tickets 
    SET status = 'escalated',
        escalated_at = now(),
        assigned_to = (
            SELECT p.id 
            FROM public.profiles p 
            WHERE p.role = 'admin'::user_role 
            LIMIT 1
        )
    WHERE status IN ('open', 'in_progress') 
      AND sla_due_at < now() 
      AND escalated_at IS NULL;
END;
$$;

-- Update mark_ticket_messages_read function with secure search_path
CREATE OR REPLACE FUNCTION public.mark_ticket_messages_read(p_ticket_id UUID, p_message_ids UUID[] DEFAULT NULL)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.ticket_messages 
    SET read_by = read_by || jsonb_build_object(auth.uid()::text, now()::text)
    WHERE ticket_id = p_ticket_id
      AND (p_message_ids IS NULL OR id = ANY(p_message_ids))
      AND NOT (read_by ? auth.uid()::text);
END;
$$;

-- Update close_ticket function with secure search_path
CREATE OR REPLACE FUNCTION public.close_ticket(p_ticket_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.tickets 
    SET status = 'closed',
        closed_at = now(),
        closed_by = auth.uid(),
        updated_at = now()
    WHERE id = p_ticket_id;
    
    -- Add final event to order
    INSERT INTO public.order_events (order_id, event_type, actor_id, meta)
    SELECT t.order_id, 'ticket_closed', auth.uid(), 
           jsonb_build_object('ticket_id', p_ticket_id, 'reason', p_reason)
    FROM public.tickets t
    WHERE t.id = p_ticket_id;
END;
$$;