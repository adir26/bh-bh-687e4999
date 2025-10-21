-- Add lead_id to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id);

-- Add product_id to order_items table
ALTER TABLE public.order_items 
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_lead_id ON public.orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Add comment for documentation
COMMENT ON COLUMN public.orders.lead_id IS 'Reference to the lead that generated this order';
COMMENT ON COLUMN public.order_items.product_id IS 'Optional reference to product catalog item';