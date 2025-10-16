-- Create quote share links table for public sharing
CREATE TABLE IF NOT EXISTS public.quote_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS quote_share_links_token_idx ON public.quote_share_links(token);
CREATE INDEX IF NOT EXISTS quote_share_links_quote_id_idx ON public.quote_share_links(quote_id);

-- Enable RLS
ALTER TABLE public.quote_share_links ENABLE ROW LEVEL SECURITY;

-- Policy: Suppliers can insert links for their own quotes
CREATE POLICY "Suppliers can create share links for their quotes"
ON public.quote_share_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_share_links.quote_id
    AND q.supplier_id = auth.uid()
  )
);

-- Policy: Suppliers can view their own quote links
CREATE POLICY "Suppliers can view their quote share links"
ON public.quote_share_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_share_links.quote_id
    AND (q.supplier_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role)
  )
);

-- Policy: Admins can manage all links
CREATE POLICY "Admins can manage all share links"
ON public.quote_share_links
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);