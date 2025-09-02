-- Mark all existing profiles as completed to prevent forced re-onboarding
-- This only affects rows existing at the time of migration; future users are not affected
BEGIN;

UPDATE public.profiles
SET 
  onboarding_status = 'completed'::onboarding_status,
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
  onboarding_step = NULL,
  onboarding_version = COALESCE(onboarding_version, 1),
  updated_at = now()
WHERE 
  (onboarding_status IS NULL OR onboarding_status <> 'completed'::onboarding_status OR onboarding_completed IS DISTINCT FROM true);

COMMIT;