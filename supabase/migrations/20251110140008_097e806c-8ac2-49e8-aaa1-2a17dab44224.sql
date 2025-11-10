-- Create pdf_events table for analytics tracking
create table if not exists pdf_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references inspection_reports(id) on delete cascade,
  context text not null check (context in ('inspection', 'proposal', 'quote')),
  event_type text not null check (event_type in ('generate', 'email_sent', 'error', 'download', 'view')),
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_pdf_events_report_id on pdf_events(report_id);
create index if not exists idx_pdf_events_context on pdf_events(context);
create index if not exists idx_pdf_events_created_at on pdf_events(created_at desc);

-- Enable RLS
alter table pdf_events enable row level security;

-- Allow authenticated users to view their own events
create policy "Users can view their own PDF events"
  on pdf_events for select
  using (
    exists (
      select 1 from inspection_reports ir
      where ir.id = pdf_events.report_id
      and ir.supplier_id = auth.uid()
    )
  );

-- Add final_pdf_path column to inspection_reports if not exists
alter table inspection_reports 
add column if not exists final_pdf_path text;