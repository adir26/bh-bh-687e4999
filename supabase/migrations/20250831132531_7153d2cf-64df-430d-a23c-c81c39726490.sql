-- Fix critical database security issues

-- 1. Add search_path to functions missing it
CREATE OR REPLACE FUNCTION public.set_limit(real)
RETURNS real
LANGUAGE c
STRICT
SET search_path TO 'public'
AS '$libdir/pg_trgm', 'set_limit';

CREATE OR REPLACE FUNCTION public.show_limit()
RETURNS real
LANGUAGE c
STABLE PARALLEL SAFE STRICT
SET search_path TO 'public'
AS '$libdir/pg_trgm', 'show_limit';

CREATE OR REPLACE FUNCTION public.show_trgm(text)
RETURNS text[]
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT
SET search_path TO 'public'
AS '$libdir/pg_trgm', 'show_trgm';

CREATE OR REPLACE FUNCTION public.similarity(text, text)
RETURNS real
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT
SET search_path TO 'public'
AS '$libdir/pg_trgm', 'similarity';

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT REGEXP_REPLACE(LOWER(TRIM(txt)), '[^א-תa-z0-9\-\s]+', '', 'g')::TEXT
$$;

-- 2. Add critical RLS policy to prevent role escalation
CREATE POLICY "Prevent non-admin role changes" ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  -- Allow updates only if role is not being changed OR user is admin
  (OLD.role = NEW.role) OR (public.get_user_role(auth.uid()) = 'admin'::user_role)
);

-- 3. Add trigger to prevent direct role manipulation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If role is being changed and user is not admin, block it
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_user_role(auth.uid()) != 'admin'::user_role THEN
      RAISE EXCEPTION 'Access denied: Only administrators can modify user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Strengthen admin credentials security
ALTER TABLE public.admin_credentials ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.admin_credentials ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.admin_credentials ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 5. Create secure admin session validation function
CREATE OR REPLACE FUNCTION public.validate_admin_session(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_record record;
  v_is_locked boolean := false;
BEGIN
  -- Check if user exists and has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND role = 'admin'::user_role
  ) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_admin');
  END IF;

  -- Get admin credentials
  SELECT * INTO v_admin_record
  FROM public.admin_credentials
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'no_credentials');
  END IF;

  -- Check if account is locked
  IF v_admin_record.locked_until IS NOT NULL AND v_admin_record.locked_until > now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'account_locked');
  END IF;

  -- Update last login
  UPDATE public.admin_credentials 
  SET last_login_at = now(), 
      login_attempts = 0,
      locked_until = NULL
  WHERE user_id = _user_id;

  RETURN jsonb_build_object('valid', true, 'session_data', jsonb_build_object(
    'user_id', _user_id,
    'validated_at', extract(epoch from now())
  ));
END;
$$;