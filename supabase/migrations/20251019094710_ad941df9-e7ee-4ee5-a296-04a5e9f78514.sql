-- Create trigger function to update quote status from approval
CREATE OR REPLACE FUNCTION public.update_quote_from_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update quote status
  UPDATE public.quotes
  SET 
    status = NEW.status::TEXT,
    responded_at = NEW.approval_date,
    viewed_at = COALESCE(viewed_at, NEW.approval_date),
    updated_at = NOW()
  WHERE id = NEW.quote_id;
  
  -- Create notification for supplier
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  ) VALUES (
    NEW.supplier_id,
    'quote_' || NEW.status,
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
      'status', NEW.status
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on quote_approvals table
DROP TRIGGER IF EXISTS on_quote_approval ON public.quote_approvals;

CREATE TRIGGER on_quote_approval
  AFTER INSERT ON public.quote_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_from_approval();