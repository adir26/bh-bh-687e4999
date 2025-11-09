-- Fix the validate_quote_send trigger to allow setting lead_id to NULL when deleting leads
-- This is necessary because when deleting a lead, related quotes should be allowed to have NULL lead_id

DROP TRIGGER IF EXISTS trg_validate_quote_send ON public.quotes;

-- Update the function to only validate when status is being changed to 'sent'
-- Not when lead_id is being set to NULL (which happens during lead deletion)
CREATE OR REPLACE FUNCTION public.validate_quote_send()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only validate if status is 'sent' AND both client_id and lead_id are NULL
  -- Allow setting lead_id to NULL without triggering validation (for lead deletion)
  IF NEW.status = 'sent' AND NEW.client_id IS NULL AND NEW.lead_id IS NULL THEN
    RAISE EXCEPTION 'Cannot send quote without a client or lead';
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trg_validate_quote_send
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.validate_quote_send();

-- Also add a policy to allow suppliers to delete their own leads
DROP POLICY IF EXISTS "Suppliers can delete their own leads" ON public.leads;
CREATE POLICY "Suppliers can delete their own leads"
ON public.leads
FOR DELETE
USING (supplier_id = auth.uid());