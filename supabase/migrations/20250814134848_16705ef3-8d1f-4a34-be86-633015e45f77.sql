-- Create the user_role enum type that's missing
CREATE TYPE user_role AS ENUM ('client', 'supplier', 'admin');

-- Update the profiles table to use the enum type for role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';

-- Update existing profiles that might have role as text
UPDATE public.profiles 
SET role = 'client'::user_role 
WHERE role IS NULL;