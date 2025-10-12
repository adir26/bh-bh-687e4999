-- Fix audit_trigger_function - resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
        
        -- Find changed fields (fix ambiguous key reference)
        SELECT array_agg(o.key) INTO changed_fields
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
$function$;