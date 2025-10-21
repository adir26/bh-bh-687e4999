-- Fix orders.current_status default and normalize values to 'new'
-- 1) Normalize existing rows
UPDATE public.orders
SET current_status = 'new'
WHERE current_status IS NULL OR current_status = 'pending';

-- 2) Ensure DEFAULT and NOT NULL on current_status
ALTER TABLE public.orders
  ALTER COLUMN current_status SET DEFAULT 'new';

ALTER TABLE public.orders
  ALTER COLUMN current_status SET NOT NULL;

-- 3) Add a trigger to normalize incoming values from any insertion path (RPCs, direct inserts)
CREATE OR REPLACE FUNCTION public.normalize_order_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.current_status IS NULL OR NEW.current_status = 'pending' THEN
    NEW.current_status := 'new';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_order_status ON public.orders;
CREATE TRIGGER trg_normalize_order_status
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.normalize_order_status();
