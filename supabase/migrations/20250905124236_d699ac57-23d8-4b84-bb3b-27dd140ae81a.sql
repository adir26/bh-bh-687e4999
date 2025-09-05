-- Fix handle_new_user to safely cast enum fields and avoid signup failures
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role_text text;
  v_role public.user_role;
  v_full_name text;
  v_status_text text;
  v_status public.onboarding_status;
  v_onboarding_completed boolean;
  v_onboarding_step integer;
BEGIN
  -- Derive and validate role
  v_role_text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');
  v_role := CASE 
    WHEN v_role_text IN ('client','supplier','admin') THEN v_role_text::public.user_role
    ELSE 'client'::public.user_role
  END;

  -- Profile basics
  v_full_name := NEW.raw_user_meta_data ->> 'full_name';

  -- Onboarding fields with safe enum cast
  v_status_text := COALESCE(NEW.raw_user_meta_data ->> 'onboarding_status', 'not_started');
  v_status := CASE 
    WHEN v_status_text IN ('not_started','in_progress','completed') THEN v_status_text::public.onboarding_status
    ELSE 'not_started'::public.onboarding_status
  END;

  v_onboarding_completed := COALESCE((NEW.raw_user_meta_data ->> 'onboarding_completed')::boolean, false);
  v_onboarding_step := COALESCE((NEW.raw_user_meta_data ->> 'onboarding_step')::integer, 0);

  -- Insert profile row for the new auth user
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
    v_status,
    v_onboarding_step,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();

  RETURN NEW;
END;
$function$;