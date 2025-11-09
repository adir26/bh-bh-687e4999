-- Add foreign key constraint on quotes.lead_id to properly handle lead deletions
-- When a lead is deleted, set the lead_id in related quotes to NULL

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_lead_id_fkey;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_lead_id_fkey 
FOREIGN KEY (lead_id) 
REFERENCES public.leads(id) 
ON DELETE SET NULL;

-- Also ensure client_id has proper constraint
ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_client_id_fkey;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;