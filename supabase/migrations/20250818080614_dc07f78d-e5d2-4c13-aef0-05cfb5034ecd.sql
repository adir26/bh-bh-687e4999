-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Recreate the function with correct parameter name
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = uid
$$;