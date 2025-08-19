-- Fix database function security issues by setting proper search_path
-- This prevents search path injection attacks and ensures functions run safely

-- Update all existing functions to have secure search_path
ALTER FUNCTION public.get_user_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_lead_status() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.validate_product_publish() SET search_path = 'public';
ALTER FUNCTION public.check_user_role(uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_quote_number() SET search_path = 'public';
ALTER FUNCTION public.generate_ticket_number() SET search_path = 'public';
ALTER FUNCTION public.set_quote_number() SET search_path = 'public';
ALTER FUNCTION public.set_ticket_number() SET search_path = 'public';
ALTER FUNCTION public.generate_lead_number() SET search_path = 'public';
ALTER FUNCTION public.set_lead_number() SET search_path = 'public';
ALTER FUNCTION public.track_order_status_change() SET search_path = 'public';
ALTER FUNCTION public.audit_trigger_function() SET search_path = 'public';
ALTER FUNCTION public.refresh_supplier_stats() SET search_path = 'public';
ALTER FUNCTION public.refresh_project_analytics() SET search_path = 'public';
ALTER FUNCTION public.refresh_popular_products() SET search_path = 'public';
ALTER FUNCTION public.refresh_category_performance() SET search_path = 'public';
ALTER FUNCTION public.refresh_all_analytics() SET search_path = 'public';
ALTER FUNCTION public.log_performance_metric(text, numeric, jsonb) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Create admin role and assign it to a user
-- First, let's create a secure admin authentication system

-- Create admin credentials table for secure admin login
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on admin credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow admins to manage admin credentials
CREATE POLICY "Only admins can manage admin credentials" ON public.admin_credentials
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add updated_at trigger for admin_credentials
CREATE TRIGGER update_admin_credentials_updated_at
    BEFORE UPDATE ON public.admin_credentials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_credentials 
        WHERE admin_credentials.user_id = $1
    );
$$;

-- Create a function to promote a user to admin (can only be called by existing admins)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if caller is admin (except for the first admin promotion)
    IF EXISTS (SELECT 1 FROM public.admin_credentials) THEN
        IF NOT public.is_admin(auth.uid()) THEN
            RAISE EXCEPTION 'Only admins can promote users to admin';
        END IF;
    END IF;
    
    -- Insert admin credentials
    INSERT INTO public.admin_credentials (user_id) 
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update user profile role to admin
    UPDATE public.profiles 
    SET role = 'admin'::user_role, updated_at = now()
    WHERE id = target_user_id;
END;
$$;