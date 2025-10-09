-- Clean up duplicate companies (keep only the most recent one per owner_id)
WITH duplicates AS (
  SELECT id, owner_id,
    ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at DESC, updated_at DESC) as rn
  FROM public.companies
)
DELETE FROM public.companies
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the UNIQUE constraint
ALTER TABLE public.companies 
ADD CONSTRAINT companies_owner_id_unique UNIQUE (owner_id);

-- Remove demo notifications function
DROP FUNCTION IF EXISTS public.create_sample_notifications(uuid);

-- Create real-time notification triggers
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.supplier_id IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.supplier_id,
      'lead_new',
      'ליד חדש התקבל',
      format('לקוח חדש "%s" פנה אליך', COALESCE(NEW.name, 'ללא שם')),
      jsonb_build_object('lead_id', NEW.id, 'lead_name', NEW.name)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_quote_status()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Notify supplier
    IF NEW.status = 'accepted' THEN
      PERFORM public.create_notification(
        NEW.supplier_id,
        'quote_accepted',
        'הצעת מחיר אושרה!',
        format('הצעת המחיר מס'' %s אושרה', NEW.quote_number),
        jsonb_build_object('quote_id', NEW.id, 'status', NEW.status)
      );
    END IF;
    
    -- Notify client
    IF NEW.client_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.client_id,
        'quote_status_change',
        'הצעת מחיר עודכנה',
        format('הצעת המחיר מס'' %s עודכנה לסטטוס: %s', NEW.quote_number, NEW.status),
        jsonb_build_object('quote_id', NEW.id, 'status', NEW.status)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_status()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.current_status IS DISTINCT FROM OLD.current_status THEN
    -- Notify client
    PERFORM public.create_notification(
      NEW.client_id,
      'order_status_change',
      'הזמנה עודכנה',
      format('ההזמנה "%s" עברה לשלב: %s', NEW.title, NEW.current_status),
      jsonb_build_object('order_id', NEW.id, 'status', NEW.current_status)
    );
    
    -- Notify supplier
    PERFORM public.create_notification(
      NEW.supplier_id,
      'order_status_change',
      'הזמנה עודכנה',
      format('ההזמנה "%s" עודכנה', NEW.title),
      jsonb_build_object('order_id', NEW.id, 'status', NEW.current_status)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_lead_created ON public.leads;
DROP TRIGGER IF EXISTS on_quote_status_changed ON public.quotes;
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;

-- Create triggers
CREATE TRIGGER on_lead_created
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.notify_new_lead();

CREATE TRIGGER on_quote_status_changed
AFTER UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.notify_quote_status();

CREATE TRIGGER on_order_status_changed
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_status();