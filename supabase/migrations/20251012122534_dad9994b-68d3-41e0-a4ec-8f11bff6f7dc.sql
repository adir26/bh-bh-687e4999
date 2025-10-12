
-- Create table for public quote share links
CREATE TABLE IF NOT EXISTS public.quote_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  accessed_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_quote_share_links_token ON public.quote_share_links(token);

-- RLS: Anyone can view via token (read-only)
CREATE POLICY "Public access via token"
ON public.quote_share_links
FOR SELECT
TO anon, authenticated
USING (expires_at > now());

-- RLS: Suppliers can create links for their quotes
CREATE POLICY "Suppliers can create share links"
ON public.quote_share_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes
    WHERE quotes.id = quote_share_links.quote_id
      AND quotes.supplier_id = auth.uid()
  )
);

-- Enable RLS
ALTER TABLE public.quote_share_links ENABLE ROW LEVEL SECURITY;
