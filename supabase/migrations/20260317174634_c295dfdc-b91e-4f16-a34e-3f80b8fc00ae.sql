
SELECT cron.schedule(
  'send-meeting-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/send-meeting-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc2xrbWhuaXR6bnZieGZwY3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTc0ODEsImV4cCI6MjA2OTI5MzQ4MX0.yt9-ethxGb1ztiLT7mXYZyVqGu0P1a37BG6Ju2NnUHk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
