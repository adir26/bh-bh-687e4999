-- Add new columns to leads table for CRM automation
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sla_risk BOOLEAN DEFAULT FALSE;

-- Create lead_activities table for tracking interactions
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'note', 'call', 'email', 'meeting'
    content TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_automations table for scheduling automation rules
CREATE TABLE public.lead_automations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL, -- 'reminder', 'escalation', 'auto_assign'
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    rule_config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_automations ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_activities
CREATE POLICY "Lead activities follow lead permissions"
ON public.lead_activities
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = lead_activities.lead_id
        AND (l.supplier_id = auth.uid() OR l.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
)
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = lead_activities.lead_id
        AND (l.supplier_id = auth.uid() OR l.assigned_to = auth.uid())
    )
);

-- RLS policies for lead_automations
CREATE POLICY "Automation rules follow lead permissions"
ON public.lead_automations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.leads l
        WHERE l.id = lead_automations.lead_id
        AND (l.supplier_id = auth.uid() OR l.assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    )
);

-- Function to update first_response_at when activity is added
CREATE OR REPLACE FUNCTION public.update_first_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update first_response_at if this is the first response and it's from supplier/assigned user
    IF NEW.activity_type IN ('note', 'call', 'email') THEN
        UPDATE public.leads 
        SET first_response_at = COALESCE(first_response_at, NEW.created_at),
            sla_risk = FALSE
        WHERE id = NEW.lead_id 
          AND first_response_at IS NULL
          AND (supplier_id = NEW.created_by OR assigned_to = NEW.created_by);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for first response tracking
CREATE TRIGGER trigger_update_first_response
    AFTER INSERT ON public.lead_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_first_response();

-- Function to calculate SLA metrics
CREATE OR REPLACE FUNCTION public.get_sla_metrics(
    p_supplier_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_metrics JSONB;
    v_avg_response_time INTERVAL;
    v_response_rate NUMERIC;
    v_sla_compliant NUMERIC;
BEGIN
    -- Check authorization
    IF NOT EXISTS (
        SELECT 1 FROM public.leads 
        WHERE supplier_id = p_supplier_id 
        AND (supplier_id = auth.uid() OR assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
        LIMIT 1
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Calculate average time to first response
    SELECT AVG(first_response_at - created_at) INTO v_avg_response_time
    FROM public.leads
    WHERE supplier_id = p_supplier_id
      AND first_response_at IS NOT NULL
      AND created_at >= now() - INTERVAL '1 day' * p_days;

    -- Calculate response rate (% of leads that got a response)
    SELECT 
        ROUND(
            (COUNT(*) FILTER (WHERE first_response_at IS NOT NULL)::NUMERIC / 
             COUNT(*)::NUMERIC * 100), 2
        ) INTO v_response_rate
    FROM public.leads
    WHERE supplier_id = p_supplier_id
      AND created_at >= now() - INTERVAL '1 day' * p_days;

    -- Calculate SLA compliance (% responded within 2 hours)
    SELECT 
        ROUND(
            (COUNT(*) FILTER (WHERE first_response_at IS NOT NULL AND 
                              first_response_at - created_at <= INTERVAL '2 hours')::NUMERIC / 
             COUNT(*)::NUMERIC * 100), 2
        ) INTO v_sla_compliant
    FROM public.leads
    WHERE supplier_id = p_supplier_id
      AND created_at >= now() - INTERVAL '1 day' * p_days;

    RETURN jsonb_build_object(
        'avg_response_time_hours', COALESCE(EXTRACT(EPOCH FROM v_avg_response_time) / 3600, 0),
        'response_rate_percent', COALESCE(v_response_rate, 0),
        'sla_compliant_percent', COALESCE(v_sla_compliant, 0),
        'period_days', p_days
    );
END;
$$;

-- Function to auto-assign leads using round-robin
CREATE OR REPLACE FUNCTION public.auto_assign_leads()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead RECORD;
    v_next_assignee UUID;
    v_assigned_count INTEGER := 0;
BEGIN
    -- Loop through unassigned leads
    FOR v_lead IN 
        SELECT l.id, l.supplier_id
        FROM public.leads l
        WHERE l.assigned_to IS NULL 
          AND l.status = 'new'
          AND l.created_at >= now() - INTERVAL '24 hours'
        ORDER BY l.created_at ASC
        LIMIT 50  -- Process max 50 leads per run
    LOOP
        -- Get next assignee using round-robin (based on profile creation order for suppliers)
        SELECT p.id INTO v_next_assignee
        FROM public.profiles p
        WHERE p.role = 'supplier'
          AND (p.id = v_lead.supplier_id OR EXISTS (
              SELECT 1 FROM public.companies c 
              WHERE c.owner_id = v_lead.supplier_id 
                AND c.id IN (
                    SELECT c2.id FROM public.companies c2 
                    WHERE c2.owner_id = p.id OR c2.id = p.id
                )
          ))
        ORDER BY 
            -- Simple round-robin based on recent assignment count
            (SELECT COUNT(*) FROM public.leads WHERE assigned_to = p.id AND created_at >= now() - INTERVAL '1 day'),
            p.created_at ASC
        LIMIT 1;

        -- Assign the lead
        IF v_next_assignee IS NOT NULL THEN
            UPDATE public.leads 
            SET assigned_to = v_next_assignee,
                updated_at = now()
            WHERE id = v_lead.id;

            -- Create automation rule for SLA reminder
            INSERT INTO public.lead_automations (lead_id, rule_type, next_run_at, rule_config)
            VALUES (
                v_lead.id,
                'sla_reminder',
                now() + INTERVAL '2 hours',
                jsonb_build_object('assigned_to', v_next_assignee)
            );

            v_assigned_count := v_assigned_count + 1;
        END IF;
    END LOOP;

    RETURN v_assigned_count;
END;
$$;

-- Function to process SLA reminders
CREATE OR REPLACE FUNCTION public.process_sla_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_automation RECORD;
    v_processed_count INTEGER := 0;
BEGIN
    -- Process pending SLA reminders
    FOR v_automation IN
        SELECT la.*, l.id as lead_id, l.name as lead_name, l.supplier_id, l.assigned_to
        FROM public.lead_automations la
        JOIN public.leads l ON l.id = la.lead_id
        WHERE la.rule_type = 'sla_reminder'
          AND la.status = 'pending'
          AND la.next_run_at <= now()
          AND l.first_response_at IS NULL  -- Still no response
          AND (l.snoozed_until IS NULL OR l.snoozed_until <= now())  -- Not snoozed
    LOOP
        -- Mark lead as SLA risk
        UPDATE public.leads 
        SET sla_risk = TRUE
        WHERE id = v_automation.lead_id;

        -- Send notification to assigned user or supplier
        INSERT INTO public.notifications (user_id, type, title, message, payload)
        VALUES (
            COALESCE(v_automation.assigned_to, v_automation.supplier_id),
            'lead_sla_breach',
            'תגובה דרושה - הפרת SLA',
            'הליד "' || v_automation.lead_name || '" ממתין לתגובה ראשונה זה יותר מ-2 שעות',
            jsonb_build_object(
                'lead_id', v_automation.lead_id,
                'breach_type', 'first_response'
            )
        );

        -- Mark automation as executed
        UPDATE public.lead_automations
        SET status = 'executed',
            executed_at = now()
        WHERE id = v_automation.id;

        v_processed_count := v_processed_count + 1;
    END LOOP;

    RETURN v_processed_count;
END;
$$;

-- Function to snooze lead
CREATE OR REPLACE FUNCTION public.snooze_lead(
    p_lead_id UUID,
    p_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user can access this lead
    IF NOT EXISTS (
        SELECT 1 FROM public.leads 
        WHERE id = p_lead_id 
        AND (supplier_id = auth.uid() OR assigned_to = auth.uid() OR get_user_role(auth.uid()) = 'admin')
    ) THEN
        RETURN FALSE;
    END IF;

    -- Update snooze time and clear SLA risk
    UPDATE public.leads
    SET snoozed_until = now() + INTERVAL '1 hour' * p_hours,
        sla_risk = FALSE,
        updated_at = now()
    WHERE id = p_lead_id;

    -- Cancel pending reminders
    UPDATE public.lead_automations
    SET status = 'cancelled'
    WHERE lead_id = p_lead_id 
      AND rule_type = 'sla_reminder'
      AND status = 'pending';

    RETURN TRUE;
END;
$$;