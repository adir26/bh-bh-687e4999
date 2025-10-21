-- Add missing columns to orders and order_items + triggers
BEGIN;

-- Orders table - add missing columns
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS address_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS total_amount numeric(12,2) NOT NULL DEFAULT 0;

-- Order items table - rename and add columns
DO $$
BEGIN
  -- Rename qty to quantity if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'qty'
  ) THEN
    ALTER TABLE public.order_items RENAME COLUMN qty TO quantity;
  END IF;
END $$;

-- Add missing columns to order_items
ALTER TABLE IF EXISTS public.order_items
  ADD COLUMN IF NOT EXISTS quantity numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS line_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description text;

-- Trigger to calculate line_total automatically
CREATE OR REPLACE FUNCTION public.set_line_total() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.line_total := COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_price, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_line_total ON public.order_items;
CREATE TRIGGER trg_order_items_line_total
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.set_line_total();

-- Trigger to recalc total_amount on orders table
CREATE OR REPLACE FUNCTION public.recalc_order_total() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.orders o
  SET total_amount = COALESCE((
    SELECT SUM(line_total) 
    FROM public.order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ), 0)
  WHERE o.id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_sum_total_ins ON public.order_items;
DROP TRIGGER IF EXISTS trg_orders_sum_total_upd ON public.order_items;
DROP TRIGGER IF EXISTS trg_orders_sum_total_del ON public.order_items;

CREATE TRIGGER trg_orders_sum_total_ins 
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();

CREATE TRIGGER trg_orders_sum_total_upd 
AFTER UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();

CREATE TRIGGER trg_orders_sum_total_del 
AFTER DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.recalc_order_total();

COMMIT;