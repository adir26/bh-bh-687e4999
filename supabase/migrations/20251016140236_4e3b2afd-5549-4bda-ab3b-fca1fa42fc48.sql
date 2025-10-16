-- Fix generate_quote_number to prevent duplicate keys using advisory lock
CREATE OR REPLACE FUNCTION public.generate_quote_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    new_number TEXT;
    counter INTEGER;
    lock_key BIGINT := hashtext('quote_number_lock');
BEGIN
    -- Acquire advisory lock to prevent concurrent generation
    PERFORM pg_advisory_xact_lock(lock_key);
    
    -- Get the current year
    SELECT TO_CHAR(NOW(), 'YYYY') INTO new_number;
    
    -- Get the count of quotes this year
    SELECT COUNT(*) + 1 INTO counter 
    FROM public.quotes 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    -- Format: YYYY-NNNN (e.g., 2025-0001)
    new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$function$;