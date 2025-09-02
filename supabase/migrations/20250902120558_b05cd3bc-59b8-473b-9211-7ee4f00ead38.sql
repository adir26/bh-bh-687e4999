-- Fix the ambiguous column reference in security_audit_trigger first
CREATE OR REPLACE FUNCTION public.security_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
        ARRAY(SELECT o.key FROM jsonb_each(to_jsonb(OLD)) o JOIN jsonb_each(to_jsonb(NEW)) n ON o.key = n.key WHERE o.value IS DISTINCT FROM n.value)
      ELSE NULL END,
      now()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Now proceed with the database schema updates
-- Create proper enums for onboarding status
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_status public.onboarding_status DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Convert onboarding_step from text to integer (safe conversion)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_step_int INTEGER DEFAULT 0;

-- Migrate existing text steps to integers
UPDATE public.profiles 
SET onboarding_step_int = CASE 
  WHEN onboarding_step = '/onboarding/welcome' THEN 1
  WHEN onboarding_step = '/onboarding/interests' THEN 2
  WHEN onboarding_step = '/onboarding/home-details' THEN 3
  WHEN onboarding_step = '/onboarding/project-planning' THEN 4
  WHEN onboarding_step = '/onboarding/documents' THEN 5
  WHEN onboarding_step = '/onboarding/supplier-welcome' THEN 1
  WHEN onboarding_step = '/onboarding/supplier-company-info' THEN 2
  WHEN onboarding_step = '/onboarding/supplier-branding' THEN 3
  WHEN onboarding_step = '/onboarding/supplier-products' THEN 4
  WHEN onboarding_step = '/onboarding/supplier-summary' THEN 5
  ELSE 0
END;

-- Drop old column and rename new one
ALTER TABLE public.profiles DROP COLUMN IF EXISTS onboarding_step;
ALTER TABLE public.profiles RENAME COLUMN onboarding_step_int TO onboarding_step;

-- Update existing records based on current state
UPDATE public.profiles 
SET 
  onboarding_status = CASE 
    WHEN onboarding_completed = true THEN 'completed'::onboarding_status
    WHEN onboarding_step > 0 THEN 'in_progress'::onboarding_status
    ELSE 'not_started'::onboarding_status
  END,
  onboarding_completed_at = CASE 
    WHEN onboarding_completed = true THEN last_onboarding_at
    ELSE NULL
  END;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON public.profiles(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed_at ON public.profiles(onboarding_completed_at);

-- Update handle_new_user function to set proper initial values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_role text;
BEGIN
    -- Get role from metadata, default to 'client'
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Validate role
    IF user_role NOT IN ('client', 'supplier', 'admin') THEN
        user_role := 'client';
    END IF;
    
    -- Insert into profiles table with proper initial onboarding state
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        onboarding_completed,
        onboarding_status,
        onboarding_step,
        onboarding_data,
        onboarding_version,
        first_login_at,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role::user_role,
        false,
        'not_started'::onboarding_status,
        0,
        '{}',
        1,
        now(), -- Set first_login_at on account creation
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        last_login_at = now(), -- Update last login on each auth
        updated_at = now();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;