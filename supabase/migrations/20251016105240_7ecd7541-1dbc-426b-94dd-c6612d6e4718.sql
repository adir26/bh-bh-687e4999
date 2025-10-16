-- Add template column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS template text DEFAULT 'premium';

-- Add constraint to ensure valid template values
ALTER TABLE public.quotes 
ADD CONSTRAINT valid_template_values 
CHECK (template IN ('premium', 'corporate', 'modern', 'minimal', 'classic'));

-- Add order_id column if not exists (for converting quote to order)
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_order_id ON public.quotes(order_id);
CREATE INDEX IF NOT EXISTS idx_quotes_template ON public.quotes(template);

-- RLS Policy: Allow suppliers to delete their own draft/rejected quotes
CREATE POLICY "Suppliers can delete draft or rejected quotes"
ON public.quotes
FOR DELETE
TO authenticated
USING (
  auth.uid() = supplier_id 
  AND status IN ('draft', 'rejected')
);

-- Add comment for documentation
COMMENT ON COLUMN public.quotes.template IS 'Design template for the quote PDF (premium, corporate, modern, minimal, classic)';
COMMENT ON COLUMN public.quotes.order_id IS 'Reference to order if this quote was converted to an order';