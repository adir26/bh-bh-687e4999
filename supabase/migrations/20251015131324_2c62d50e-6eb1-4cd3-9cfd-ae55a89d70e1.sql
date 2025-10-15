-- Make client_id nullable for draft quotes
ALTER TABLE public.quotes
ALTER COLUMN client_id DROP NOT NULL;

-- Ensure quote_items has sort_order for stable UI ordering
ALTER TABLE public.quote_items
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill sort_order for existing items (only where still 0)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY quote_id ORDER BY created_at, id) - 1 AS rn
  FROM public.quote_items
)
UPDATE public.quote_items qi
SET sort_order = o.rn
FROM ordered o
WHERE qi.id = o.id
  AND qi.sort_order = 0;

-- Helpful index for fetching items in sort order
CREATE INDEX IF NOT EXISTS quote_items_quote_id_sort_order_idx
  ON public.quote_items (quote_id, sort_order);
