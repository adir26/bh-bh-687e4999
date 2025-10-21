-- Migration 1: Add profiles.phone with Unique Partial Index

-- Add phone column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Unique only on non-empty values (prevents duplicates, allows NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ux_profiles_phone_not_null
  ON profiles (phone)
  WHERE phone IS NOT NULL AND length(trim(phone)) > 0;

-- Regular indexes for fast search
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

COMMENT ON COLUMN profiles.phone IS 
  'Client phone number - unique when not null, allows search and deduplication';