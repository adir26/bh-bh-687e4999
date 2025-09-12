-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  opened_by UUID NOT NULL,
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'escalated', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID,
  escalated_at TIMESTAMP WITH TIME ZONE,
  sla_due_at TIMESTAMP WITH TIME ZONE,
  ticket_number TEXT NOT NULL DEFAULT ''
);

-- Create ticket_messages table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_text TEXT,
  file_url TEXT,
  file_name TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  read_by JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to set ticket number
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();

-- Auto-assign ticket to supplier and set SLA
CREATE OR REPLACE FUNCTION public.auto_assign_ticket()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_ticket_trigger
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_ticket();

-- Function to escalate overdue tickets
CREATE OR REPLACE FUNCTION public.escalate_overdue_tickets()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark ticket messages as read
CREATE OR REPLACE FUNCTION public.mark_ticket_messages_read(p_ticket_id UUID, p_message_ids UUID[] DEFAULT NULL)
RETURNS void AS $$
BEGIN
    UPDATE public.ticket_messages 
    SET read_by = read_by || jsonb_build_object(auth.uid()::text, now()::text)
    WHERE ticket_id = p_ticket_id
      AND (p_message_ids IS NULL OR id = ANY(p_message_ids))
      AND NOT (read_by ? auth.uid()::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close ticket
CREATE OR REPLACE FUNCTION public.close_ticket(p_ticket_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets
CREATE POLICY "Clients can view their own tickets"
ON public.tickets FOR SELECT
USING (
    auth.uid() = opened_by OR
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = tickets.order_id AND o.client_id = auth.uid()
    )
);

CREATE POLICY "Suppliers can view tickets on their orders"
ON public.tickets FOR SELECT
USING (
    auth.uid() = assigned_to OR
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = tickets.order_id AND o.supplier_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all tickets"
ON public.tickets FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can create tickets on their orders"
ON public.tickets FOR INSERT
WITH CHECK (
    auth.uid() = opened_by AND
    EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = tickets.order_id AND 
        (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
    )
);

CREATE POLICY "Ticket participants can update tickets"
ON public.tickets FOR UPDATE
USING (
    auth.uid() = opened_by OR 
    auth.uid() = assigned_to OR 
    get_user_role(auth.uid()) = 'admin'::user_role
);

-- RLS Policies for ticket_messages
CREATE POLICY "Ticket participants can view messages"
ON public.ticket_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_messages.ticket_id AND (
            auth.uid() = t.opened_by OR
            auth.uid() = t.assigned_to OR
            get_user_role(auth.uid()) = 'admin'::user_role OR
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = t.order_id AND 
                (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
            )
        )
    ) AND (is_internal = false OR get_user_role(auth.uid()) = 'admin'::user_role)
);

CREATE POLICY "Ticket participants can send messages"
ON public.ticket_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_messages.ticket_id AND 
        t.status NOT IN ('closed') AND (
            auth.uid() = t.opened_by OR
            auth.uid() = t.assigned_to OR 
            get_user_role(auth.uid()) = 'admin'::user_role OR
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = t.order_id AND 
                (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
            )
        )
    )
);

CREATE POLICY "Ticket participants can update messages"
ON public.ticket_messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_messages.ticket_id AND (
            auth.uid() = t.opened_by OR
            auth.uid() = t.assigned_to OR
            get_user_role(auth.uid()) = 'admin'::user_role OR
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = t.order_id AND 
                (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
            )
        )
    )
);

-- Add indexes for performance
CREATE INDEX idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_sla_due_at ON public.tickets(sla_due_at) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at);

-- Add foreign key constraints
ALTER TABLE public.tickets 
ADD CONSTRAINT fk_tickets_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.ticket_messages 
ADD CONSTRAINT fk_ticket_messages_ticket_id 
FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;

-- Create storage bucket for ticket files
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-files', 'ticket-files', false);

-- Storage policies for ticket files
CREATE POLICY "Ticket participants can view files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'ticket-files' AND
    EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE (storage.foldername(name))[1] = t.id::text AND (
            auth.uid() = t.opened_by OR
            auth.uid() = t.assigned_to OR
            get_user_role(auth.uid()) = 'admin'::user_role OR
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = t.order_id AND 
                (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
            )
        )
    )
);

CREATE POLICY "Ticket participants can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'ticket-files' AND
    EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE (storage.foldername(name))[1] = t.id::text AND 
        t.status NOT IN ('closed') AND (
            auth.uid() = t.opened_by OR
            auth.uid() = t.assigned_to OR
            get_user_role(auth.uid()) = 'admin'::user_role OR
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = t.order_id AND 
                (o.client_id = auth.uid() OR o.supplier_id = auth.uid())
            )
        )
    )
);

-- Add updated_at trigger for tickets
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for ticket_messages  
CREATE TRIGGER update_ticket_messages_updated_at
    BEFORE UPDATE ON public.ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();