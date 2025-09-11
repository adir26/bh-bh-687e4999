-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_opt_in BOOLEAN NOT NULL DEFAULT true,
  push_opt_in BOOLEAN NOT NULL DEFAULT true,
  categories JSONB NOT NULL DEFAULT '{
    "leads": true,
    "quotes": true, 
    "orders": true,
    "reviews": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lead_new', 'lead_status_change', 'quote_viewed', 'quote_accepted', 'quote_rejected', 'order_status_change', 'review_new')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE id = notification_id AND user_id = auth.uid();
$$;

-- Helper function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE user_id = auth.uid() AND read_at IS NULL;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  prefs RECORD;
  category TEXT;
BEGIN
  -- Map notification type to category
  category := CASE 
    WHEN p_type LIKE 'lead_%' THEN 'leads'
    WHEN p_type LIKE 'quote_%' THEN 'quotes'
    WHEN p_type LIKE 'order_%' THEN 'orders'
    WHEN p_type LIKE 'review_%' THEN 'reviews'
    ELSE 'other'
  END;

  -- Check user preferences
  SELECT * INTO prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;

  -- If no preferences exist, create default
  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id);
    
    SELECT * INTO prefs
    FROM public.notification_preferences
    WHERE user_id = p_user_id;
  END IF;

  -- Check if user wants notifications for this category
  IF (prefs.categories->category)::boolean IS NOT TRUE THEN
    RETURN NULL; -- User opted out
  END IF;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, payload)
  VALUES (p_user_id, p_type, p_title, p_message, p_payload)
  RETURNING id INTO notification_id;

  -- Call edge function for email/push delivery
  PERFORM net.http_post(
    url := concat(current_setting('app.settings.supabase_url'), '/functions/v1/fanout-notifications'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := jsonb_build_object(
      'notification_id', notification_id,
      'user_id', p_user_id,
      'type', p_type,
      'title', p_title,
      'message', p_message,
      'payload', p_payload,
      'email_opt_in', prefs.email_opt_in,
      'push_opt_in', prefs.push_opt_in
    )
  );

  RETURN notification_id;
END;
$$;

-- Triggers for leads
CREATE OR REPLACE FUNCTION public.notify_lead_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  supplier_id UUID;
  lead_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New lead notification
    IF NEW.supplier_id IS NOT NULL THEN
      SELECT name INTO lead_name FROM public.leads WHERE id = NEW.id;
      
      PERFORM public.create_notification(
        NEW.supplier_id,
        'lead_new',
        'ליד חדש',
        format('קיבלת ליד חדש מ%s', COALESCE(NEW.name, 'לקוח')),
        jsonb_build_object('lead_id', NEW.id, 'lead_name', NEW.name)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Lead status change
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.supplier_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.supplier_id,
        'lead_status_change',
        'עדכון סטטוס ליד',
        format('הליד %s שונה לסטטוס: %s', COALESCE(NEW.name, 'ללא שם'), NEW.status),
        jsonb_build_object('lead_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers for quotes
CREATE OR REPLACE FUNCTION public.notify_quote_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Quote viewed
    IF OLD.viewed_at IS NULL AND NEW.viewed_at IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.supplier_id,
        'quote_viewed',
        'הצעת המחיר נצפתה',
        format('הצעת המחיר "%s" נצפתה על ידי הלקוח', NEW.title),
        jsonb_build_object('quote_id', NEW.id, 'quote_title', NEW.title)
      );
    END IF;
    
    -- Quote status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'accepted' THEN
        PERFORM public.create_notification(
          NEW.supplier_id,
          'quote_accepted',
          'הצעת המחיר התקבלה! 🎉',
          format('הצעת המחיר "%s" התקבלה על ידי הלקוח', NEW.title),
          jsonb_build_object('quote_id', NEW.id, 'quote_title', NEW.title)
        );
      ELSIF NEW.status = 'rejected' THEN
        PERFORM public.create_notification(
          NEW.supplier_id,
          'quote_rejected',
          'הצעת המחיר נדחתה',
          format('הצעת המחיר "%s" נדחתה על ידי הלקוח', NEW.title),
          jsonb_build_object('quote_id', NEW.id, 'quote_title', NEW.title)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers for orders
CREATE OR REPLACE FUNCTION public.notify_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Order status change
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.current_status IS DISTINCT FROM NEW.current_status THEN
      DECLARE
        status_text TEXT := COALESCE(NEW.current_status, NEW.status::text);
        status_he TEXT := CASE status_text
          WHEN 'pending' THEN 'ממתין'
          WHEN 'confirmed' THEN 'מאושר'
          WHEN 'in_progress' THEN 'בביצוע'
          WHEN 'in_production' THEN 'בייצור'
          WHEN 'ready' THEN 'מוכן'
          WHEN 'shipped' THEN 'נשלח'
          WHEN 'delivered' THEN 'נמסר'
          WHEN 'completed' THEN 'הושלם'
          WHEN 'canceled' THEN 'בוטל'
          ELSE status_text
        END;
      BEGIN
        PERFORM public.create_notification(
          NEW.supplier_id,
          'order_status_change',
          'עדכון סטטוס הזמנה',
          format('הזמנה "%s" שונתה לסטטוס: %s', NEW.title, status_he),
          jsonb_build_object('order_id', NEW.id, 'order_title', NEW.title, 'new_status', status_text)
        );
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_notify_lead_changes
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lead_changes();

CREATE TRIGGER trigger_notify_quote_changes
  AFTER UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_quote_changes();

CREATE TRIGGER trigger_notify_order_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_changes();