-- Fix handle_new_user to cast role to enum and (re)create trigger on auth.users
-- Safe: wrap in transaction
BEGIN;

-- Ensure the enum exists (no-op if already exists)
-- Note: We won't attempt to create the enum to avoid conflicts; assume it exists as referenced across functions

-- Replace function with robust casting and defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_text text;
  v_role public.user_role;
  v_full_name text;
  v_onboarding_completed boolean;
  v_onboarding_status text;
  v_onboarding_step integer;
BEGIN
  v_role_text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');
  v_role := CASE 
    WHEN v_role_text IN ('client','supplier','admin') THEN v_role_text::public.user_role
    ELSE 'client'::public.user_role
  END;

  v_full_name := NEW.raw_user_meta_data ->> 'full_name';
  v_onboarding_completed := COALESCE((NEW.raw_user_meta_data ->> 'onboarding_completed')::boolean, false);
  v_onboarding_status := COALESCE(NEW.raw_user_meta_data ->> 'onboarding_status', 'not_started');
  v_onboarding_step := COALESCE((NEW.raw_user_meta_data ->> 'onboarding_step')::integer, 0);

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    onboarding_completed,
    onboarding_status,
    onboarding_step,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    v_onboarding_completed,
    v_onboarding_status,
    v_onboarding_step,
    now(),
    now()
  );

  RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;