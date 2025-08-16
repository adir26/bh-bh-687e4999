-- Fix profiles table structure and trigger (corrected)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update profiles table to ensure proper structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Ensure role column has proper constraints (fixed column reference)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'profiles_role_check' 
                   AND table_schema = 'public'
                   AND constraint_catalog = current_database()) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('client', 'supplier', 'admin'));
    END IF;
END $$;

-- Create improved handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get role from metadata, default to 'client'
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Validate role
    IF user_role NOT IN ('client', 'supplier', 'admin') THEN
        user_role := 'client';
    END IF;
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role::text,
        false,
        now(),
        now()
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure get_user_role function exists and works properly
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT role FROM public.profiles WHERE id = user_id;
$$;