-- Fix Critical Security Vulnerabilities

-- 1. Fix privilege escalation in profiles table - restrict role updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent users from updating critical fields
  (OLD.role = NEW.role) AND 
  (OLD.id = NEW.id) AND
  (OLD.created_at = NEW.created_at)
);

-- 2. Create secure admin role management function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role user_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can update roles
  IF public.get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Prevent self-demotion (last admin protection)
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    -- Check if this is the last admin
    IF (SELECT count(*) FROM profiles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last admin user';
    END IF;
  END IF;
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the role change
  INSERT INTO public.audit_logs (
    table_name, operation, user_id, record_id, 
    old_values, new_values, changed_fields
  ) VALUES (
    'profiles', 'UPDATE', auth.uid(), target_user_id,
    jsonb_build_object('role', (SELECT role FROM profiles WHERE id = target_user_id)),
    jsonb_build_object('role', new_role),
    ARRAY['role']
  );
END;
$$;

-- 3. Fix database function search_path vulnerabilities
CREATE OR REPLACE FUNCTION public.supplier_dashboard_metrics(_supplier_id uuid, _from timestamp with time zone, _to timestamp with time zone)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v jsonb;
  company_exists boolean;
BEGIN
  -- Authorization: ensure caller owns this company/supplier
  SELECT EXISTS (
    SELECT 1 
    FROM public.companies c 
    WHERE c.owner_id = auth.uid() 
      AND c.id = _supplier_id
  ) INTO company_exists;
  
  -- Also check if user is directly the supplier (for individual suppliers)
  IF NOT company_exists THEN
    SELECT EXISTS (
      SELECT 1 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
        AND p.id = _supplier_id 
        AND p.role = 'supplier'
    ) INTO company_exists;
  END IF;
  
  IF NOT company_exists THEN
    RAISE EXCEPTION 'Not authorized to access this supplier data';
  END IF;

  -- Calculate metrics (keeping existing logic)
  WITH
  lead_base AS (
    SELECT * FROM public.leads
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  quote_base AS (
    SELECT * FROM public.quotes
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  order_base AS (
    SELECT * FROM public.orders
    WHERE supplier_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  review_base AS (
    SELECT * FROM public.reviews
    WHERE reviewed_id = _supplier_id
      AND created_at >= _from AND created_at < _to
  ),
  prev_period_duration AS (
    SELECT _to - _from AS duration
  ),
  prev_order_base AS (
    SELECT * FROM public.orders
    WHERE supplier_id = _supplier_id
      AND created_at >= (_from - (SELECT duration FROM prev_period_duration))
      AND created_at < _from
  )
  SELECT jsonb_build_object(
    'leads_new', (SELECT count(*) FROM lead_base),
    'leads_in_progress', (
      SELECT count(*) 
      FROM public.leads 
      WHERE supplier_id = _supplier_id 
        AND status IN ('new', 'contacted', 'proposal_sent')
        AND created_at < _to
    ),
    'lead_conversion_rate', (
      CASE 
        WHEN (SELECT count(*) FROM lead_base) > 0 THEN
          ROUND(
            (SELECT count(*) FROM order_base WHERE status <> 'canceled')::numeric / 
            (SELECT count(*) FROM lead_base)::numeric * 100, 2
          )
        ELSE 0
      END
    ),
    'quotes_sent', (SELECT count(*) FROM quote_base),
    'quotes_accepted', (
      SELECT count(*) 
      FROM public.quotes 
      WHERE supplier_id = _supplier_id 
        AND status = 'accepted'
        AND sent_at >= _from AND sent_at < _to
    ),
    'orders_active', (
      SELECT count(*) 
      FROM public.orders 
      WHERE supplier_id = _supplier_id 
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND created_at < _to
    ),
    'orders_completed', (
      SELECT count(*) 
      FROM order_base 
      WHERE status = 'completed'
    ),
    'revenue', COALESCE((
      SELECT sum(amount) 
      FROM order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'aov', COALESCE((
      SELECT ROUND(avg(amount), 2) 
      FROM order_base 
      WHERE status = 'completed'
    ), 0),
    'rating_avg', COALESCE((
      SELECT ROUND(avg(rating), 1) 
      FROM review_base
    ), 0),
    'reviews_count', (SELECT count(*) FROM review_base),
    'avg_response_time_hours', (
      SELECT COALESCE(
        ROUND(
          AVG(EXTRACT(EPOCH FROM (last_contact_date - created_at)) / 3600)::numeric, 1
        ), 0
      )
      FROM lead_base 
      WHERE last_contact_date IS NOT NULL
    ),
    'prev_revenue', COALESCE((
      SELECT sum(amount) 
      FROM prev_order_base 
      WHERE status IN ('completed', 'confirmed', 'in_progress')
    ), 0),
    'prev_orders_completed', (
      SELECT count(*) 
      FROM prev_order_base 
      WHERE status = 'completed'
    )
  ) INTO v;

  RETURN v;
END;
$$;

-- 4. Create secure input validation function
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  input_text TEXT,
  max_length INTEGER DEFAULT 1000,
  allow_html BOOLEAN DEFAULT FALSE
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic length validation
  IF length(input_text) > max_length THEN
    RAISE EXCEPTION 'Input exceeds maximum length of % characters', max_length;
  END IF;
  
  -- XSS prevention - remove dangerous patterns
  IF NOT allow_html THEN
    -- Remove script tags and event handlers
    input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
    input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
    input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
    -- Remove HTML tags if not allowed
    input_text := regexp_replace(input_text, '<[^>]+>', '', 'g');
  END IF;
  
  -- Remove null bytes and other dangerous characters
  input_text := replace(input_text, E'\x00', '');
  
  RETURN trim(input_text);
END;
$$;

-- 5. Add security audit trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.security_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log security-sensitive operations
  IF TG_TABLE_NAME IN ('profiles', 'admin_credentials', 'companies') THEN
    INSERT INTO public.audit_logs (
      table_name, operation, user_id, record_id,
      old_values, new_values, changed_fields,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      auth.uid(),
      COALESCE((NEW).id, (OLD).id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
      CASE WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(SELECT key FROM jsonb_each(to_jsonb(OLD)) o JOIN jsonb_each(to_jsonb(NEW)) n ON o.key = n.key WHERE o.value IS DISTINCT FROM n.value)
      ELSE NULL END,
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply security audit triggers
DROP TRIGGER IF EXISTS security_audit_profiles ON public.profiles;
CREATE TRIGGER security_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();

DROP TRIGGER IF EXISTS security_audit_admin_credentials ON public.admin_credentials;
CREATE TRIGGER security_audit_admin_credentials
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();