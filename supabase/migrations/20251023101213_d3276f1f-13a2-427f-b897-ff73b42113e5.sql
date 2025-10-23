-- Backfill kpi_daily with 30 days of historical data
DO $$
DECLARE
  target_date date;
BEGIN
  -- Loop through last 30 days and call refresh_kpi_daily for each
  FOR i IN 0..29 LOOP
    target_date := CURRENT_DATE - i;
    
    -- Call the refresh function for this date
    PERFORM refresh_kpi_daily(target_date);
    
    -- Log progress
    RAISE NOTICE 'Refreshed KPI data for %', target_date;
  END LOOP;
  
  RAISE NOTICE 'Successfully backfilled 30 days of KPI data';
END $$;