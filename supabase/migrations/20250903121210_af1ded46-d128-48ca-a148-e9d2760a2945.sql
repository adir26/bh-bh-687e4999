-- Update the handle_new_user function to ensure new users start with correct onboarding status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
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
  )
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name', 
    COALESCE(new.raw_user_meta_data ->> 'role', 'client'),
    COALESCE((new.raw_user_meta_data ->> 'onboarding_completed')::boolean, false),
    COALESCE(new.raw_user_meta_data ->> 'onboarding_status', 'not_started'),
    COALESCE((new.raw_user_meta_data ->> 'onboarding_step')::integer, 0),
    now(),
    now()
  );
  RETURN new;
END;
$$;