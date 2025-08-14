-- Create quotes table
CREATE TABLE public.quotes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL,
    client_id uuid,
    order_id uuid,
    title text NOT NULL,
    notes text,
    subtotal numeric NOT NULL DEFAULT 0,
    tax_rate numeric NOT NULL DEFAULT 17,
    tax_amount numeric NOT NULL DEFAULT 0,
    total_amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'ILS',
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quote_items table
CREATE TABLE public.quote_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    quantity numeric NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    subtotal numeric NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotes
CREATE POLICY "Suppliers can create quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can view their quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update their quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = supplier_id);

CREATE POLICY "Clients can view sent quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = client_id AND status IN ('sent', 'accepted', 'rejected'));

CREATE POLICY "Clients can update quote status" ON public.quotes
    FOR UPDATE USING (auth.uid() = client_id AND status IN ('sent', 'accepted', 'rejected'));

-- RLS policies for quote_items
CREATE POLICY "Quote items follow quote permissions" ON public.quote_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quotes
            WHERE quotes.id = quote_items.quote_id
            AND (quotes.supplier_id = auth.uid() OR 
                 (quotes.client_id = auth.uid() AND quotes.status IN ('sent', 'accepted', 'rejected')))
        )
    );

-- Indexes
CREATE INDEX idx_quotes_supplier_id ON public.quotes(supplier_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);

-- Trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();