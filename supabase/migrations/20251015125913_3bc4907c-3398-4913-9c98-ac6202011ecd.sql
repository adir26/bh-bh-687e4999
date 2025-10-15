-- Allow quotes to be saved without a client (for drafts with leads or no client yet)
ALTER TABLE public.quotes
ALTER COLUMN client_id DROP NOT NULL;

-- Add a check to prevent sending quotes without a client
-- (This is enforced in the app, but we add a safety net in the DB)
CREATE OR REPLACE FUNCTION public.validate_quote_send()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND NEW.client_id IS NULL THEN
    RAISE EXCEPTION 'Cannot send quote without a client profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_quote_send
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.validate_quote_send();