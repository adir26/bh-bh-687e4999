-- Remove old sync triggers that interfere with new lead statuses
-- These triggers try to sync old status values with new ones and cause errors

-- Drop functions with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS public.tg_sync_lead_status() CASCADE;
DROP FUNCTION IF EXISTS public.tg_sync_lead_source() CASCADE;
DROP FUNCTION IF EXISTS public.tg_sync_lead_priority() CASCADE;