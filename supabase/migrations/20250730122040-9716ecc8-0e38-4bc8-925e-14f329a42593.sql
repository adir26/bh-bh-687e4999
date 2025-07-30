-- Phase 2: Enhanced Features

-- Product Categories Junction Table (Many-to-Many)
CREATE TABLE public.product_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, category_id)
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Anyone can view product categories" 
ON public.product_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Suppliers can manage their product categories" 
ON public.product_categories 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.products 
        WHERE products.id = product_categories.product_id 
        AND products.supplier_id = auth.uid()
    )
);

-- Lead Management System
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    supplier_id UUID,
    project_id UUID,
    source TEXT DEFAULT 'website' CHECK (source IN ('website', 'referral', 'social_media', 'advertising', 'direct', 'other')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost', 'nurturing')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_value NUMERIC(12,2),
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    notes TEXT,
    contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'in_person', 'video_call', 'chat')),
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID,
    lost_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Clients can view their own leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Suppliers can view assigned leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() = supplier_id OR auth.uid() = assigned_to);

CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Suppliers can update assigned leads" 
ON public.leads 
FOR UPDATE 
USING (auth.uid() = supplier_id OR auth.uid() = assigned_to);

CREATE POLICY "System can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Lead Activities/Timeline
CREATE TABLE public.lead_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'proposal_sent', 'follow_up', 'status_change')),
    title TEXT NOT NULL,
    description TEXT,
    outcome TEXT,
    next_action TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_activities
CREATE POLICY "Lead activities follow lead permissions" 
ON public.lead_activities 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.leads 
        WHERE leads.id = lead_activities.lead_id 
        AND (leads.client_id = auth.uid() OR leads.supplier_id = auth.uid() OR leads.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
) WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.leads 
        WHERE leads.id = lead_activities.lead_id 
        AND (leads.client_id = auth.uid() OR leads.supplier_id = auth.uid() OR leads.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Analytics and Reporting Tables
CREATE TABLE public.user_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(15,4) NOT NULL,
    metric_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, metric_name, metric_date)
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON public.user_analytics 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (true);

-- Company Analytics
CREATE TABLE public.company_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(15,4) NOT NULL,
    metric_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, metric_name, metric_date)
);

-- Enable RLS
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_analytics
CREATE POLICY "Company owners can view their analytics" 
ON public.company_analytics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = company_analytics.company_id 
        AND companies.owner_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all company analytics" 
ON public.company_analytics 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert company analytics" 
ON public.company_analytics 
FOR INSERT 
WITH CHECK (true);

-- Enhanced Order Tracking
CREATE TABLE public.order_status_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    status TEXT NOT NULL,
    changed_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
CREATE POLICY "Order history follows order permissions" 
ON public.order_status_history 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_status_history.order_id 
        AND (orders.client_id = auth.uid() OR orders.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
) WITH CHECK (
    auth.uid() = changed_by AND
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_status_history.order_id 
        AND (orders.client_id = auth.uid() OR orders.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Favorites/Wishlist System
CREATE TABLE public.user_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'company', 'supplier', 'project')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Search History and Preferences
CREATE TABLE public.search_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    search_query TEXT NOT NULL,
    search_filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID,
    clicked_result_type TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_history
CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all search history" 
ON public.search_history 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.product_categories ADD CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.product_categories ADD CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE public.leads ADD CONSTRAINT fk_leads_client FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.leads ADD CONSTRAINT fk_leads_supplier FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD CONSTRAINT fk_leads_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD CONSTRAINT fk_leads_assigned FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.lead_activities ADD CONSTRAINT fk_lead_activities_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
ALTER TABLE public.lead_activities ADD CONSTRAINT fk_lead_activities_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_analytics ADD CONSTRAINT fk_user_analytics_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.company_analytics ADD CONSTRAINT fk_company_analytics_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.order_status_history ADD CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_status_history ADD CONSTRAINT fk_order_status_history_user FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_favorites ADD CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.search_history ADD CONSTRAINT fk_search_history_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);

CREATE INDEX idx_leads_client_id ON public.leads(client_id);
CREATE INDEX idx_leads_supplier_id ON public.leads(supplier_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_expected_close_date ON public.leads(expected_close_date);

CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_user_id ON public.lead_activities(user_id);
CREATE INDEX idx_lead_activities_type ON public.lead_activities(activity_type);
CREATE INDEX idx_lead_activities_scheduled ON public.lead_activities(scheduled_for);

CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_metric ON public.user_analytics(metric_name);
CREATE INDEX idx_user_analytics_date ON public.user_analytics(metric_date);

CREATE INDEX idx_company_analytics_company_id ON public.company_analytics(company_id);
CREATE INDEX idx_company_analytics_metric ON public.company_analytics(metric_name);
CREATE INDEX idx_company_analytics_date ON public.company_analytics(metric_date);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_status ON public.order_status_history(status);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_type ON public.user_favorites(item_type);
CREATE INDEX idx_user_favorites_item ON public.user_favorites(item_id);

CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_query ON public.search_history(search_query);
CREATE INDEX idx_search_history_created ON public.search_history(created_at);
CREATE INDEX idx_search_history_session ON public.search_history(session_id);

-- Generate lead numbers function
CREATE OR REPLACE FUNCTION public.generate_lead_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current year and month
    SELECT TO_CHAR(NOW(), 'YYYYMM') INTO new_number;
    
    -- Get the count of leads this month
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.leads 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
    
    -- Format: YYYYMM-L-NNNN (e.g., 202401-L-0001)
    new_number := new_number || '-L-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate lead numbers
CREATE OR REPLACE FUNCTION public.set_lead_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lead_number IS NULL OR NEW.lead_number = '' THEN
        NEW.lead_number := public.generate_lead_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lead_number
    BEFORE INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_lead_number();

-- Function to track order status changes
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'NULL') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_order_status_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.track_order_status_change();