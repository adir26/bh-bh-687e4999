-- Fix update_quote_from_approval trigger to map statuses correctly
-- Maps 'approved' from quote_approvals to 'accepted' in quotes table
-- Maps 'rejected' from quote_approvals to 'rejected' in quotes table

CREATE OR REPLACE FUNCTION public.update_quote_from_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
  
  -- Create notification for supplier with correct status mapping
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
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
    'הלקוח ' || NEW.client_name || ' (' || NEW.client_email || ') ' ||
    CASE 
      WHEN NEW.status = 'approved' THEN 'אישר' 
      ELSE 'דחה' 
    END || ' את הצעת המחיר',
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