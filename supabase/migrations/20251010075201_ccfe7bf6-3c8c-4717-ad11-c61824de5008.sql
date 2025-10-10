-- Phase 1: Add permissive policy for company creation
-- Allow any authenticated user to create their own company with pending status
create policy "Users can create own company (pending)"
on public.companies
for insert
to authenticated
with check (
  auth.uid() = owner_id 
  AND coalesce(status, 'pending') = 'pending'
);

-- Phase 2: Fix existing policies to use user_roles table instead of profiles.role
-- This prevents security issues and recursive RLS checks

-- Drop old policies that rely on get_user_role(profiles.role)
drop policy if exists "Suppliers can create companies" on public.companies;
drop policy if exists "Suppliers can manage own company basic info" on public.companies;

-- Create new policy using has_role for supplier management
create policy "Suppliers can manage their own company"
on public.companies
for update
to authenticated
using (
  auth.uid() = owner_id 
  AND public.has_role(auth.uid(), 'supplier'::app_role)
);

-- Update admin policies to use has_role
drop policy if exists "Admins can manage all companies" on public.companies;
drop policy if exists "Admins can update any company" on public.companies;

create policy "Admins have full access to companies"
on public.companies
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role))
with check (public.has_role(auth.uid(), 'admin'::app_role));