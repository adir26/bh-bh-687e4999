-- Backfill KPI data for the last 90 days
DO $$
DECLARE
  v_date DATE;
  v_start_date DATE := CURRENT_DATE - INTERVAL '90 days';
BEGIN
  -- Loop through each date from 90 days ago to today
  FOR v_date IN 
    SELECT generate_series(v_start_date::date, CURRENT_DATE::date, '1 day'::interval)::date
  LOOP
    -- Call refresh_kpi_daily for each date
    PERFORM refresh_kpi_daily(v_date);
  END LOOP;
END $$;

-- Update profiles to have proper onboarding status if missing
UPDATE profiles
SET 
  onboarding_status = CASE 
    WHEN onboarding_status IS NULL OR onboarding_status = 'not_started' THEN 'completed'
    ELSE onboarding_status
  END,
  onboarding_completed_at = CASE 
    WHEN onboarding_completed_at IS NULL AND (onboarding_status IS NULL OR onboarding_status = 'not_started') THEN created_at + INTERVAL '5 minutes'
    ELSE onboarding_completed_at
  END
WHERE created_at < NOW() - INTERVAL '1 day';

-- Update companies status if needed
UPDATE companies
SET status = COALESCE(status, 'approved')
WHERE status IS NULL;

UPDATE companies  
SET verification_status = COALESCE(verification_status, 'verified')
WHERE verification_status IS NULL AND status = 'approved';