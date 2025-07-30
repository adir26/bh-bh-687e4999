-- Phase 3: Performance and Optimization (Fixed)

-- Audit Logging System
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    user_id UUID,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- System Health Monitoring
CREATE TABLE public.system_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('performance', 'usage', 'error', 'business')),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(15,4) NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(metric_name, timestamp)
);

-- Enable RLS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_metrics (admin only)
CREATE POLICY "Only admins can manage system metrics" 
ON public.system_metrics 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Materialized Views for Performance
CREATE MATERIALIZED VIEW public.supplier_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.owner_id as supplier_id,
    COALESCE(order_stats.total_orders, 0) as total_orders,
    COALESCE(order_stats.completed_orders, 0) as completed_orders,
    COALESCE(order_stats.total_revenue, 0) as total_revenue,
    COALESCE(review_stats.review_count, 0) as review_count,
    COALESCE(review_stats.avg_rating, 0) as avg_rating,
    COALESCE(product_stats.product_count, 0) as product_count,
    COALESCE(product_stats.published_products, 0) as published_products,
    COALESCE(quote_stats.total_quotes, 0) as total_quotes,
    COALESCE(quote_stats.accepted_quotes, 0) as accepted_quotes,
    COALESCE(lead_stats.total_leads, 0) as total_leads,
    COALESCE(lead_stats.converted_leads, 0) as converted_leads,
    c.created_at,
    NOW() as last_updated
FROM public.companies c
LEFT JOIN (
    SELECT 
        supplier_id,
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        SUM(amount) as total_revenue
    FROM public.orders 
    GROUP BY supplier_id
) order_stats ON c.owner_id = order_stats.supplier_id
LEFT JOIN (
    SELECT 
        reviewed_id,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
    FROM public.reviews 
    GROUP BY reviewed_id
) review_stats ON c.owner_id = review_stats.reviewed_id
LEFT JOIN (
    SELECT 
        supplier_id,
        COUNT(*) as product_count,
        COUNT(*) FILTER (WHERE is_published = true) as published_products
    FROM public.products 
    GROUP BY supplier_id
) product_stats ON c.owner_id = product_stats.supplier_id
LEFT JOIN (
    SELECT 
        supplier_id,
        COUNT(*) as total_quotes,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_quotes
    FROM public.quotes 
    GROUP BY supplier_id
) quote_stats ON c.owner_id = quote_stats.supplier_id
LEFT JOIN (
    SELECT 
        supplier_id,
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'won') as converted_leads
    FROM public.leads 
    GROUP BY supplier_id
) lead_stats ON c.owner_id = lead_stats.supplier_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_supplier_stats_company_id ON public.supplier_stats(company_id);

-- Project Analytics Materialized View
CREATE MATERIALIZED VIEW public.project_analytics AS
SELECT 
    p.id as project_id,
    p.title,
    p.client_id,
    p.status,
    p.budget_min,
    p.budget_max,
    COALESCE(order_stats.total_orders, 0) as total_orders,
    COALESCE(order_stats.total_spent, 0) as total_spent,
    COALESCE(quote_stats.total_quotes, 0) as total_quotes,
    COALESCE(quote_stats.avg_quote_value, 0) as avg_quote_value,
    COALESCE(lead_stats.total_leads, 0) as total_leads,
    p.created_at,
    p.start_date,
    p.end_date,
    NOW() as last_updated
FROM public.projects p
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as total_orders,
        SUM(amount) as total_spent
    FROM public.orders 
    WHERE project_id IS NOT NULL
    GROUP BY project_id
) order_stats ON p.id = order_stats.project_id
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as total_quotes,
        AVG(total_amount) as avg_quote_value
    FROM public.quotes 
    WHERE project_id IS NOT NULL
    GROUP BY project_id
) quote_stats ON p.id = quote_stats.project_id
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as total_leads
    FROM public.leads 
    WHERE project_id IS NOT NULL
    GROUP BY project_id
) lead_stats ON p.id = lead_stats.project_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_project_analytics_project_id ON public.project_analytics(project_id);

-- Popular Products View
CREATE MATERIALIZED VIEW public.popular_products AS
SELECT 
    p.id as product_id,
    p.name,
    p.supplier_id,
    p.category_id,
    p.price,
    COALESCE(quote_usage.quote_count, 0) as times_quoted,
    COALESCE(favorite_stats.favorite_count, 0) as favorite_count,
    COALESCE(search_stats.search_count, 0) as search_mentions,
    (
        COALESCE(quote_usage.quote_count, 0) * 3 +
        COALESCE(favorite_stats.favorite_count, 0) * 2 +
        COALESCE(search_stats.search_count, 0)
    ) as popularity_score,
    p.created_at,
    NOW() as last_updated
FROM public.products p
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as quote_count
    FROM public.quote_items 
    WHERE product_id IS NOT NULL
    GROUP BY product_id
) quote_usage ON p.id = quote_usage.product_id
LEFT JOIN (
    SELECT 
        item_id,
        COUNT(*) as favorite_count
    FROM public.user_favorites 
    WHERE item_type = 'product'
    GROUP BY item_id
) favorite_stats ON p.id = favorite_stats.item_id
LEFT JOIN (
    SELECT 
        clicked_result_id,
        COUNT(*) as search_count
    FROM public.search_history 
    WHERE clicked_result_type = 'product'
    GROUP BY clicked_result_id
) search_stats ON p.id = search_stats.clicked_result_id
WHERE p.is_published = true;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_popular_products_product_id ON public.popular_products(product_id);

-- Category Performance View
CREATE MATERIALIZED VIEW public.category_performance AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    COALESCE(product_stats.product_count, 0) as total_products,
    COALESCE(product_stats.published_products, 0) as published_products,
    COALESCE(project_stats.project_count, 0) as projects_in_category,
    COALESCE(search_stats.search_count, 0) as search_frequency,
    COALESCE(quote_stats.avg_quote_value, 0) as avg_quote_value,
    c.created_at,
    NOW() as last_updated
FROM public.categories c
LEFT JOIN (
    SELECT 
        category_id,
        COUNT(*) as product_count,
        COUNT(*) FILTER (WHERE is_published = true) as published_products
    FROM public.products 
    WHERE category_id IS NOT NULL
    GROUP BY category_id
) product_stats ON c.id = product_stats.category_id
LEFT JOIN (
    SELECT 
        category_id,
        COUNT(*) as project_count
    FROM public.projects 
    WHERE category_id IS NOT NULL
    GROUP BY category_id
) project_stats ON c.id = project_stats.category_id
LEFT JOIN (
    SELECT 
        (search_filters->>'category_id')::UUID as category_id,
        COUNT(*) as search_count
    FROM public.search_history 
    WHERE search_filters->>'category_id' IS NOT NULL
    GROUP BY (search_filters->>'category_id')::UUID
) search_stats ON c.id = search_stats.category_id
LEFT JOIN (
    SELECT 
        p.category_id,
        AVG(qi.unit_price * qi.quantity) as avg_quote_value
    FROM public.quote_items qi
    JOIN public.products p ON qi.product_id = p.id
    WHERE p.category_id IS NOT NULL
    GROUP BY p.category_id
) quote_stats ON c.id = quote_stats.category_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_category_performance_category_id ON public.category_performance(category_id);

-- Advanced Indexes for Performance (without CONCURRENTLY)
CREATE INDEX idx_orders_created_at_btree ON public.orders(created_at);
CREATE INDEX idx_orders_amount_btree ON public.orders(amount);
CREATE INDEX idx_orders_status_created_at ON public.orders(status, created_at);

CREATE INDEX idx_projects_budget_range ON public.projects(budget_min, budget_max);
CREATE INDEX idx_projects_dates ON public.projects(start_date, end_date);
CREATE INDEX idx_projects_status_client ON public.projects(status, client_id);

CREATE INDEX idx_products_price_range ON public.products(price) WHERE is_published = true;
CREATE INDEX idx_products_search_text ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_quotes_dates ON public.quotes(created_at, valid_until);
CREATE INDEX idx_quotes_amount_status ON public.quotes(total_amount, status);

CREATE INDEX idx_reviews_rating_created ON public.reviews(rating, created_at);
CREATE INDEX idx_reviews_reviewed_rating ON public.reviews(reviewed_id, rating);

CREATE INDEX idx_notifications_unread ON public.notifications(user_id, created_at) WHERE is_read = false;
CREATE INDEX idx_notifications_priority ON public.notifications(priority, created_at);

-- Composite indexes for common queries
CREATE INDEX idx_leads_supplier_status_date ON public.leads(supplier_id, status, expected_close_date);
CREATE INDEX idx_lead_activities_lead_date ON public.lead_activities(lead_id, created_at);

-- Full-text search indexes
CREATE INDEX idx_companies_search_text ON public.companies USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_support_tickets_search ON public.support_tickets USING gin(to_tsvector('english', title || ' ' || description));

-- Time-series indexes for analytics
CREATE INDEX idx_user_analytics_date_metric ON public.user_analytics(metric_date, metric_name);
CREATE INDEX idx_company_analytics_date_metric ON public.company_analytics(metric_date, metric_name);
CREATE INDEX idx_search_history_date ON public.search_history(created_at);
CREATE INDEX idx_audit_logs_date ON public.audit_logs(created_at);

-- Generic audit function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    changed_fields TEXT[];
BEGIN
    -- Convert OLD and NEW to JSONB
    IF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        new_values := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_values := NULL;
        new_values := to_jsonb(NEW);
    ELSE -- UPDATE
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_values) o
        JOIN jsonb_each(new_values) n ON o.key = n.key
        WHERE o.value IS DISTINCT FROM n.value;
    END IF;
    
    -- Insert audit record
    INSERT INTO public.audit_logs (
        table_name,
        operation,
        user_id,
        record_id,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        COALESCE((NEW).id, (OLD).id),
        old_values,
        new_values,
        changed_fields
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
CREATE TRIGGER audit_companies_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_quotes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_projects_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Functions to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_supplier_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.supplier_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_project_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.project_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_popular_products()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_category_performance()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.category_performance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_all_analytics()
RETURNS VOID AS $$
BEGIN
    PERFORM public.refresh_supplier_stats();
    PERFORM public.refresh_project_analytics();
    PERFORM public.refresh_popular_products();
    PERFORM public.refresh_category_performance();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for materialized views
CREATE INDEX idx_supplier_stats_rating ON public.supplier_stats(avg_rating DESC);
CREATE INDEX idx_supplier_stats_revenue ON public.supplier_stats(total_revenue DESC);
CREATE INDEX idx_supplier_stats_orders ON public.supplier_stats(total_orders DESC);

CREATE INDEX idx_project_analytics_budget ON public.project_analytics(budget_max DESC);
CREATE INDEX idx_project_analytics_spent ON public.project_analytics(total_spent DESC);

CREATE INDEX idx_popular_products_score ON public.popular_products(popularity_score DESC);
CREATE INDEX idx_popular_products_category ON public.popular_products(category_id, popularity_score DESC);

CREATE INDEX idx_category_performance_projects ON public.category_performance(projects_in_category DESC);
CREATE INDEX idx_category_performance_searches ON public.category_performance(search_frequency DESC);

-- Add constraints and foreign keys for audit tables
ALTER TABLE public.audit_logs ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_audit_logs_table_operation ON public.audit_logs(table_name, operation);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

CREATE INDEX idx_system_metrics_type_name ON public.system_metrics(metric_type, metric_name);
CREATE INDEX idx_system_metrics_timestamp ON public.system_metrics(timestamp);

-- Performance monitoring function
CREATE OR REPLACE FUNCTION public.log_performance_metric(
    p_metric_name TEXT,
    p_metric_value NUMERIC,
    p_labels JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_metrics (metric_type, metric_name, metric_value, labels)
    VALUES ('performance', p_metric_name, p_metric_value, p_labels);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;