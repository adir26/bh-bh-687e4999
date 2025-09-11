-- Create notification preferences table
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  system boolean not null default false,
  orders boolean not null default false,
  marketing boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notification_preferences enable row level security;

-- Create RLS policies
create policy "notification_prefs_select_own" on public.notification_preferences
  for select using (auth.uid() = user_id);

create policy "notification_prefs_upsert_own" on public.notification_preferences
  for insert with check (auth.uid() = user_id);

create policy "notification_prefs_update_own" on public.notification_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create RPC function for upsert
create or replace function public.set_notification_pref(p_system boolean, p_orders boolean, p_marketing boolean)
returns void language sql security definer set search_path = public as $$
  insert into public.notification_preferences(user_id, system, orders, marketing)
  values (auth.uid(), p_system, p_orders, p_marketing)
  on conflict (user_id) do update set
    system=excluded.system, 
    orders=excluded.orders,
    marketing=excluded.marketing, 
    updated_at=now();
$$;

-- Add trigger for updated_at
create trigger update_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.update_updated_at_column();