-- Add missing columns to profiles table for onboarding tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('client','supplier','admin')) DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step text,
  ADD COLUMN IF NOT EXISTS onboarding_context jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_onboarding_at timestamptz;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_onboarding_completed_idx ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS profiles_onboarding_step_idx ON public.profiles(onboarding_step);

-- Update existing profiles to have the client role if null
UPDATE public.profiles SET role = 'client' WHERE role IS NULL;