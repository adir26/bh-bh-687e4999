-- Fix company profile RLS policy to support both profiles.role and user_roles
-- This fixes the issue where suppliers can't edit their profile

-- Drop the restrictive policy that requires user_roles check
DROP POLICY IF EXISTS "Suppliers can manage their own company" ON public.companies;

-- Update the main policy to be more flexible
DROP POLICY IF EXISTS "Company owners can update their company" ON public.companies;

CREATE POLICY "Company owners can update their company" ON public.companies
  FOR UPDATE
  USING (
    auth.uid() = owner_id 
    AND (
      -- Check profiles.role OR user_roles table
      get_user_role(auth.uid()) = 'supplier'::user_role
      OR has_role(auth.uid(), 'supplier'::app_role)
    )
  );