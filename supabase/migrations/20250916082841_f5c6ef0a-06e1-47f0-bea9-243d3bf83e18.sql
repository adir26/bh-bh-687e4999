-- Add onboarding_skipped field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_skipped BOOLEAN DEFAULT false;