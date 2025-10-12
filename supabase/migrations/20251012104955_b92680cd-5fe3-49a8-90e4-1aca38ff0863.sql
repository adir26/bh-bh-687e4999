-- ============================================
-- Phase 1: Fix RLS on user_roles table
-- ============================================

-- Allow authenticated users to add supplier role to themselves
create policy "Users can add supplier role to themselves"
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id 
  AND role = 'supplier'::app_role
);

-- ============================================
-- Phase 2: Fix existing suppliers
-- ============================================

-- Add supplier role to all profiles that have role='supplier' but missing user_roles entry
insert into public.user_roles (user_id, role)
select p.id, 'supplier'::app_role
from public.profiles p
where p.role = 'supplier'
  and not exists (
    select 1 
    from public.user_roles ur 
    where ur.user_id = p.id 
      and ur.role = 'supplier'
  )
on conflict (user_id, role) do nothing;

-- Log the fix in audit_logs
insert into public.audit_logs (
  table_name,
  operation,
  user_id,
  record_id,
  new_values,
  changed_fields
)
select 
  'user_roles_migration',
  'INSERT',
  p.id,
  p.id,
  jsonb_build_object(
    'role', 'supplier',
    'source', 'migration_fix',
    'reason', 'sync_profiles_with_user_roles'
  ),
  array['role']
from public.profiles p
where p.role = 'supplier'
  and not exists (
    select 1 
    from public.user_roles ur 
    where ur.user_id = p.id 
      and ur.role = 'supplier'
  );