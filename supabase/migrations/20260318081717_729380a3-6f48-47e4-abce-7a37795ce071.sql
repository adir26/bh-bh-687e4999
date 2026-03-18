-- Fix: allow lead creation for any existing approved company, regardless of is_public
-- If someone can reach the profile page, they should be able to submit a lead

DROP POLICY IF EXISTS "Anyone can create leads for public companies" ON public.leads;

CREATE POLICY "Anyone can create leads for approved companies"
ON public.leads
FOR INSERT
WITH CHECK (
  company_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = company_id
      AND c.status = 'approved'
  )
);