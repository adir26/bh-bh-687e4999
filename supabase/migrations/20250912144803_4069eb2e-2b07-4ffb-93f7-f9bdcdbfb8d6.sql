-- Set up the CRM automation scheduler to run every 15 minutes
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the CRM automation to run every 15 minutes
SELECT cron.schedule(
  'crm-automation-scheduler',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/crm-automation-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc2xrbWhuaXR6bnZieGZwY3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTc0ODEsImV4cCI6MjA2OTI5MzQ4MX0.yt9-ethxGb1ztiLT7mXYZyVqGu0P1a37BG6Ju2NnUHk"}'::jsonb,
        body:=jsonb_build_object('time', now()::text)
    ) as request_id;
  $$
);