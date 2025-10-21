-- Make client_email nullable in quote_approvals table
ALTER TABLE public.quote_approvals 
ALTER COLUMN client_email DROP NOT NULL;

-- Drop all triggers first
DROP TRIGGER IF EXISTS trigger_update_quote_from_approval ON public.quote_approvals;
DROP TRIGGER IF EXISTS trigger_update_quote_on_approval ON public.quote_approvals;
DROP TRIGGER IF EXISTS on_quote_approval ON public.quote_approvals;

-- Now drop the function
DROP FUNCTION IF EXISTS public.update_quote_from_approval() CASCADE;

-- Recreate the function with correct notification columns
CREATE OR REPLACE FUNCTION public.update_quote_from_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  -- Update quote status with correct mapping
  UPDATE public.quotes
  SET 
    status = CASE 
      WHEN NEW.status = 'approved' THEN 'accepted' 
      ELSE 'rejected' 
    END,
    responded_at = NEW.approval_date,
    viewed_at = COALESCE(viewed_at, NEW.approval_date),
    updated_at = NOW()
  WHERE id = NEW.quote_id;
  
  -- Create notification for supplier with correct columns
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    message,
    metadata,
    created_at
  ) VALUES (
    NEW.supplier_id,
    CASE 
      WHEN NEW.status = 'approved' THEN 'quote_accepted' 
      ELSE 'quote_rejected' 
    END,
    CASE 
      WHEN NEW.status = 'approved' THEN '🎉 הצעת מחיר אושרה!' 
      ELSE '❌ הצעת מחיר נדחתה' 
    END,
    CASE 
      WHEN NEW.status = 'approved' THEN 'הצעת המחיר שלך אושרה' 
      ELSE 'הצעת המחיר שלך נדחתה' 
    END,
    CASE 
      WHEN NEW.status = 'approved' THEN 'הצעת המחיר שלך אושרה על ידי הלקוח - ' || NEW.client_name || COALESCE(' (' || NEW.client_email || ')', '')
      ELSE 'הצעת המחיר שלך נדחתה על ידי הלקוח - ' || NEW.client_name || COALESCE(' (' || NEW.client_email || ')', '')
    END,
    jsonb_build_object(
      'quote_id', NEW.quote_id,
      'approval_id', NEW.id,
      'client_name', NEW.client_name,
      'client_email', NEW.client_email,
      'status', CASE 
        WHEN NEW.status = 'approved' THEN 'accepted' 
        ELSE 'rejected' 
      END
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_quote_from_approval
AFTER INSERT ON public.quote_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_quote_from_approval();