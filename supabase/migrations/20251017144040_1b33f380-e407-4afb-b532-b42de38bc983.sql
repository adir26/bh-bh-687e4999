-- Drop and recreate generate_quote_number() to fix duplicate key issue
-- The function now uses MAX instead of COUNT to handle gaps in numbering

DROP FUNCTION IF EXISTS public.generate_quote_number();

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
    
    -- Get the ACTUAL max number for this year (not just count)
    -- This handles cases where quotes are deleted
    SELECT COALESCE(MAX(
      CASE 
        WHEN quote_number ~ '^[0-9]{4}-[0-9]+$' THEN
          CAST(SPLIT_PART(quote_number, '-', 2) AS INTEGER)
        ELSE 0
      END
    ), 0) + 1 INTO counter
    FROM public.quotes 
    WHERE quote_number LIKE new_number || '-%';
    
    -- Format: YYYY-NNNN (e.g., 2025-0001)
    new_number := new_number || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$function$;