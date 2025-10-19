-- Add lead_id column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;

-- Create index for lead_id
CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON public.quotes(lead_id);

-- Update the validate_quote_send trigger function to allow quotes with either client_id OR lead_id
CREATE OR REPLACE FUNCTION public.validate_quote_send()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'sent' AND NEW.client_id IS NULL AND NEW.lead_id IS NULL THEN
    RAISE EXCEPTION 'Cannot send quote without a client or lead';
  END IF;
  RETURN NEW;
END;
$$;