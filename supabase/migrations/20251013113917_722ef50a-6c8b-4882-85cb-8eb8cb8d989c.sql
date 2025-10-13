-- ============================================
-- Part A: Leads/CRM Fixes
-- ============================================

-- A1.1: Make client_id nullable in leads table
ALTER TABLE public.leads 
ALTER COLUMN client_id DROP NOT NULL;

-- A1.2: Drop old restrictive INSERT policy
DROP POLICY IF EXISTS "System can create leads" ON public.leads;

-- A1.2: Create new INSERT policy for suppliers
CREATE POLICY "Suppliers can create leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = supplier_id
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
);

-- A1.2: Keep admin/system capability
CREATE POLICY "Admins can create any lead"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR get_user_role(auth.uid()) = 'admin'::user_role
);

-- A1.3: Update existing UPDATE policy for dual role support
DROP POLICY IF EXISTS "Suppliers can update assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Suppliers can update their leads" ON public.leads;

CREATE POLICY "Suppliers can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = supplier_id OR auth.uid() = assigned_to)
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
)
WITH CHECK (
  auth.uid() = supplier_id OR auth.uid() = assigned_to
);

-- ============================================
-- Part B: Company Profile Fixes
-- ============================================

-- B1.1: Update companies UPDATE policy for dual role support
DROP POLICY IF EXISTS "Company owners can update their company" ON public.companies;
DROP POLICY IF EXISTS "Suppliers can manage own company basic info" ON public.companies;

CREATE POLICY "Suppliers can manage own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id
  AND (
    get_user_role(auth.uid()) = 'supplier'::user_role
    OR has_role(auth.uid(), 'supplier'::app_role)
  )
)
WITH CHECK (
  auth.uid() = owner_id
);