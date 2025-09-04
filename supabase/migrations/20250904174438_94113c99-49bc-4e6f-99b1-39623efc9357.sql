-- Reset stuck users and ensure clean onboarding state
UPDATE profiles 
SET 
  onboarding_completed = false,
  onboarding_status = 'not_started',
  onboarding_step = 0,
  updated_at = now()
WHERE 
  onboarding_completed IS NULL 
  OR (onboarding_completed = false AND onboarding_status = 'completed')
  OR (onboarding_step > 0 AND onboarding_status = 'not_started');

-- Ensure new users start with correct defaults
ALTER TABLE profiles 
ALTER COLUMN onboarding_completed SET DEFAULT false,
ALTER COLUMN onboarding_status SET DEFAULT 'not_started',
ALTER COLUMN onboarding_step SET DEFAULT 0;