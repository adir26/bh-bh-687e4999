-- Fix RLS policy to allow suppliers to create approved companies
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create own company (pending)" ON public.companies;

-- Create new flexible policy for supplier company creation
CREATE POLICY "Suppliers can create their company" ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id 
    AND (
      -- Support both role systems (profiles.role and user_roles)
      get_user_role(auth.uid()) = 'supplier'::user_role
      OR has_role(auth.uid(), 'supplier'::app_role)
    )
    AND status IN ('pending', 'approved')
    AND is_public IN (true, false)
  );