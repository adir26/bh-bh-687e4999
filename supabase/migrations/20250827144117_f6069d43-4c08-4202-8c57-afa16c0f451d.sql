-- Critical security fixes (round 2) - correct policy and add triggers

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate safe update policy for profiles (no OLD/NEW references)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Prevent non-admin role changes via trigger
CREATE OR REPLACE FUNCTION public.prevent_nonadmin_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_user_role(auth.uid()) <> 'admin' THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_prevent_nonadmin_role_change ON public.profiles;
CREATE TRIGGER tg_prevent_nonadmin_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_nonadmin_role_change();

-- Admin-only function to update user role centrally
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role user_role
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_logs (
    table_name, operation, user_id, record_id, 
    old_values, new_values, changed_fields
  ) VALUES (
    'profiles', 'UPDATE', auth.uid(), target_user_id,
    jsonb_build_object('role', NULL),
    jsonb_build_object('role', new_role),
    ARRAY['role']
  );
END;
$$;

-- Security audit trigger and applications
CREATE OR REPLACE FUNCTION public.security_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME IN ('profiles', 'admin_credentials', 'companies') THEN
    INSERT INTO public.audit_logs (
      table_name, operation, user_id, record_id,
      old_values, new_values, changed_fields,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      auth.uid(),
      COALESCE((NEW).id, (OLD).id),
      CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
      CASE WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(SELECT key FROM jsonb_each(to_jsonb(OLD)) o JOIN jsonb_each(to_jsonb(NEW)) n ON o.key = n.key WHERE o.value IS DISTINCT FROM n.value)
      ELSE NULL END,
      now()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS security_audit_profiles ON public.profiles;
CREATE TRIGGER security_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();

DROP TRIGGER IF EXISTS security_audit_admin_credentials ON public.admin_credentials;
CREATE TRIGGER security_audit_admin_credentials
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();