-- Add price_range column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS price_range jsonb DEFAULT jsonb_build_object(
  'min', 0,
  'max', 0,
  'currency', 'ILS'
);

COMMENT ON COLUMN public.companies.price_range IS 'Price range for services: min, max prices and currency';