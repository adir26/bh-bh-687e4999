-- Phase 1: Core Business Tables

-- Products/Services Catalog
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL,
    company_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID,
    price NUMERIC(10,2),
    price_unit TEXT DEFAULT 'each',
    is_service BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    minimum_order INTEGER DEFAULT 1,
    delivery_time_days INTEGER,
    images TEXT[],
    specifications JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view published products" 
ON public.products 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Suppliers can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = supplier_id AND get_user_role(auth.uid()) = 'supplier');

CREATE POLICY "Suppliers can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = supplier_id);

CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Quotes/Proposals System
CREATE TABLE public.quotes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number TEXT NOT NULL UNIQUE,
    supplier_id UUID NOT NULL,
    client_id UUID NOT NULL,
    project_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    terms_conditions TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Quote participants can view quotes" 
ON public.quotes 
FOR SELECT 
USING (auth.uid() = supplier_id OR auth.uid() = client_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Suppliers can create quotes" 
ON public.quotes 
FOR INSERT 
WITH CHECK (auth.uid() = supplier_id AND get_user_role(auth.uid()) = 'supplier');

CREATE POLICY "Quote participants can update quotes" 
ON public.quotes 
FOR UPDATE 
USING (auth.uid() = supplier_id OR auth.uid() = client_id);

-- Quote Items
CREATE TABLE public.quote_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL,
    product_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quote_items
CREATE POLICY "Quote items follow quote permissions" 
ON public.quote_items 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.quotes 
        WHERE quotes.id = quote_items.quote_id 
        AND (quotes.supplier_id = auth.uid() OR quotes.client_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Support/Complaints System
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    assigned_to UUID,
    order_id UUID,
    project_id UUID,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'complaint', 'technical', 'billing', 'refund')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_supplier', 'resolved', 'closed')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = assigned_to OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ticket participants and admins can update tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = assigned_to OR get_user_role(auth.uid()) = 'admin');

-- Support Messages
CREATE TABLE public.support_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[],
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_messages
CREATE POLICY "Support messages follow ticket permissions" 
ON public.support_messages 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = support_messages.ticket_id 
        AND (support_tickets.user_id = auth.uid() OR support_tickets.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
) WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = support_messages.ticket_id 
        AND (support_tickets.user_id = auth.uid() OR support_tickets.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Notifications System
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order_update', 'message', 'quote_received', 'project_update', 'payment', 'system', 'marketing')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.products ADD CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.quotes ADD CONSTRAINT fk_quotes_supplier FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.quotes ADD CONSTRAINT fk_quotes_client FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.quotes ADD CONSTRAINT fk_quotes_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.quote_items ADD CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;
ALTER TABLE public.quote_items ADD CONSTRAINT fk_quote_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.support_tickets ADD CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_support_tickets_assigned FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_support_tickets_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.support_tickets ADD CONSTRAINT fk_support_tickets_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.support_messages ADD CONSTRAINT fk_support_messages_ticket FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;
ALTER TABLE public.support_messages ADD CONSTRAINT fk_support_messages_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create basic indexes for performance
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_published ON public.products(is_published) WHERE is_published = true;
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);

CREATE INDEX idx_quotes_supplier_id ON public.quotes(supplier_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_project_id ON public.quotes(project_id);

CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON public.quote_items(product_id);

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_type ON public.support_tickets(type);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON public.support_messages(sender_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Generate quote numbers function
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current year
    SELECT TO_CHAR(NOW(), 'YYYY') INTO new_number;
    
    -- Get the count of quotes this year
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.quotes 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Format: YYYY-NNNN (e.g., 2024-0001)
    new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Generate ticket numbers function
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
    FROM public.support_tickets 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Format: YYYYMM-NNNN (e.g., 202401-0001)
    new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
        NEW.quote_number := public.generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quote_number
    BEFORE INSERT ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_quote_number();

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();