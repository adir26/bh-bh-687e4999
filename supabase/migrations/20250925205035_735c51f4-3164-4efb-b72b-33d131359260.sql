-- Create communication automation rules table
CREATE TABLE IF NOT EXISTS public.communication_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'lead_new', 'quote_sent', 'quote_viewed', 'payment_due', 'order_completed'
  trigger_conditions JSONB DEFAULT '{}',
  delay_hours INTEGER DEFAULT 0,
  channel TEXT NOT NULL, -- 'email', 'sms', 'notification', 'whatsapp'
  template_id TEXT,
  message_template JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  supplier_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automation jobs table for scheduling
CREATE TABLE IF NOT EXISTS public.automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.communication_automations(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL, -- lead_id, quote_id, order_id etc
  entity_type TEXT NOT NULL, -- 'lead', 'quote', 'order'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed', 'cancelled'
  delivery_log JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiet hours configuration table
CREATE TABLE IF NOT EXISTS public.quiet_hours_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  start_time TIME NOT NULL DEFAULT '22:00',
  end_time TIME NOT NULL DEFAULT '08:00',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting configuration
CREATE TABLE IF NOT EXISTS public.rate_limits_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  channel TEXT NOT NULL, -- 'email', 'sms', 'notification'
  max_per_hour INTEGER DEFAULT 10,
  max_per_day INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opt-out preferences table
CREATE TABLE IF NOT EXISTS public.communication_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID,
  channel TEXT NOT NULL, -- 'email', 'sms', 'notification'
  automation_type TEXT, -- specific automation type or 'all'
  opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.communication_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiet_hours_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_opt_outs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communication_automations
CREATE POLICY "Suppliers can manage their own automations" ON public.communication_automations
  FOR ALL USING (auth.uid() = supplier_id OR auth.uid() = created_by);

CREATE POLICY "Admins can manage all automations" ON public.communication_automations
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for automation_jobs
CREATE POLICY "Users can view jobs for their automations" ON public.automation_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.communication_automations ca 
      WHERE ca.id = automation_jobs.automation_id 
      AND (ca.supplier_id = auth.uid() OR ca.created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY "System can manage automation jobs" ON public.automation_jobs
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for quiet_hours_config
CREATE POLICY "Suppliers can manage their quiet hours" ON public.quiet_hours_config
  FOR ALL USING (auth.uid() = supplier_id OR public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for rate_limits_config  
CREATE POLICY "Suppliers can manage their rate limits" ON public.rate_limits_config
  FOR ALL USING (auth.uid() = supplier_id OR public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for communication_opt_outs
CREATE POLICY "Users can manage their own opt-outs" ON public.communication_opt_outs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can view opt-outs for their communications" ON public.communication_opt_outs
  FOR SELECT USING (auth.uid() = supplier_id OR public.get_user_role(auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_automation_jobs_scheduled ON public.automation_jobs(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_automation_jobs_entity ON public.automation_jobs(entity_id, entity_type);
CREATE INDEX idx_communication_automations_supplier ON public.communication_automations(supplier_id);
CREATE INDEX idx_communication_automations_trigger ON public.communication_automations(trigger_event);

-- Insert default templates
INSERT INTO public.communication_automations (name, description, trigger_event, delay_hours, channel, template_id, message_template, supplier_id, created_by) VALUES
  ('ליד חדש - הודעה מיידית', 'הודעה מיידית כאשר מתקבל ליד חדש', 'lead_new', 0, 'notification', 'lead_new_immediate', 
   '{"title": "ליד חדש התקבל!", "message": "ליד חדש מ-{client_name} עבור {project_type}. לחץ לצפייה.", "priority": "high"}', null, null),
  
  ('הצעת מחיר - אין פתיחה', 'תזכורת כאשר הצעת מחיר לא נפתחה תוך 12 שעות', 'quote_sent_no_open', 12, 'email', 'quote_reminder_12h',
   '{"subject": "תזכורת: הצעת המחיר שלך ממתינה לצפייה", "body": "שלום {client_name},\\n\\nשלחנו לך הצעת מחיר לפני 12 שעות אך עדיין לא נפתחה.\\n\\nלחץ כאן לצפייה: {quote_link}\\n\\nבברכה,\\n{supplier_name}", "type": "reminder"}', null, null),
  
  ('הצעת מחיר - נצפתה ללא אישור', 'מעקב כאשר הצעת מחיר נצפתה אך לא אושרה תוך 24 שעות', 'quote_viewed_no_accept', 24, 'sms', 'quote_viewed_reminder_24h',
   '{"message": "שלום {client_name}, ראינו שצפית בהצעת המחיר שלנו. יש לך שאלות? נשמח לעזור! {supplier_phone}", "type": "follow_up"}', null, null),

  ('תשלום - תזכורת יום 3', 'תזכורת תשלום 3 ימים לאחר תאריך יעד', 'payment_due', 72, 'email', 'payment_due_3d',
   '{"subject": "תזכורת תשלום - הזמנה #{order_number}", "body": "שלום {client_name},\\n\\nזו תזכורת ידידותית שתשלום עבור הזמנה #{order_number} בסך {amount}₪ עבר את תאריך היעד לפני 3 ימים.\\n\\nאנא בצע את התשלום בהקדם האפשרי.\\n\\nבברכה,\\n{supplier_name}", "type": "payment_reminder", "urgency": "medium"}', null, null),
  
  ('הזמנה הושלמה - בקשת ביקורת', 'בקשת ביקורת 3 ימים לאחר השלמת הזמנה', 'order_completed_review', 72, 'notification', 'order_completed_review_3d',
   '{"title": "איך היה השירות?", "message": "שלום {client_name}, נשמח לקבל את הביקורת שלך על השירות שקיבלת מ{supplier_name}. לחץ כאן לדירוג.", "action_url": "/review/{order_id}", "type": "review_request"}', null, null);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_communication_automations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communication_automations_updated_at
  BEFORE UPDATE ON public.communication_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_automations_updated_at();

CREATE TRIGGER update_quiet_hours_config_updated_at
  BEFORE UPDATE ON public.quiet_hours_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_automations_updated_at();

CREATE TRIGGER update_rate_limits_config_updated_at
  BEFORE UPDATE ON public.rate_limits_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communication_automations_updated_at();