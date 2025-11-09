-- Adjust orders.lead_id foreign key to allow deleting leads by setting lead_id to NULL on related orders
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_lead_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_lead_id_fkey
FOREIGN KEY (lead_id)
REFERENCES public.leads(id)
ON DELETE SET NULL;