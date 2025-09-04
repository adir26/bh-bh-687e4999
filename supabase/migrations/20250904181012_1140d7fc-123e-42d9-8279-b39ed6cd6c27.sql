-- Add avatar_url column to profiles table for Google OAuth users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;