-- Allow suppliers to view their own leads regardless of consent flag
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supplier can view own leads with consent" ON public.leads;
DROP POLICY IF EXISTS "supplier_can_view_leads_with_consent" ON public.leads;

CREATE POLICY "supplier can view own leads"
ON public.leads
FOR SELECT
USING (supplier_id = auth.uid());

COMMENT ON POLICY "supplier can view own leads" ON public.leads IS
'Suppliers can view leads where leads.supplier_id = auth.uid(), regardless of consent_to_share.';