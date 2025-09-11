-- Account deletion function with proper data handling
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_anonymous_id text;
BEGIN
  -- Check if the requesting user is deleting their own account
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Access denied: Can only delete your own account';
  END IF;
  
  -- Generate anonymous identifier for audit purposes
  v_anonymous_id := 'deleted_' || substring(user_id::text, 1, 8) || '_' || extract(epoch from now())::text;
  
  -- Log the deletion event for audit purposes (non-PII)
  INSERT INTO public.audit_logs (
    table_name, operation, user_id, record_id,
    old_values, new_values, changed_fields,
    created_at
  ) VALUES (
    'account_deletion', 'DELETE', user_id, user_id,
    jsonb_build_object('timestamp', now(), 'audit_id', v_anonymous_id),
    null, null, now()
  );

  -- Delete personal data across all tables
  
  -- 1. Delete user favorites and personal data
  DELETE FROM public.favorites WHERE user_id = user_id;
  DELETE FROM public.user_favorites WHERE user_id = user_id;
  DELETE FROM public.photo_likes WHERE user_id = user_id;
  DELETE FROM public.client_profiles WHERE user_id = user_id;
  
  -- 2. Delete ideabooks and related photos
  DELETE FROM public.ideabook_photos WHERE ideabook_id IN (
    SELECT id FROM public.ideabooks WHERE owner_id = user_id
  );
  DELETE FROM public.ideabook_collaborators WHERE user_id = user_id;
  DELETE FROM public.ideabooks WHERE owner_id = user_id;
  
  -- 3. Delete photos uploaded by user
  DELETE FROM public.photos WHERE uploader_id = user_id;
  
  -- 4. Delete personal messages (keep business-related ones anonymized)
  DELETE FROM public.messages WHERE sender_id = user_id OR recipient_id = user_id;
  DELETE FROM public.support_messages WHERE sender_id = user_id;
  
  -- 5. Delete/anonymize support tickets
  UPDATE public.support_tickets 
  SET user_id = null, title = 'Deleted User Ticket', description = 'User account deleted'
  WHERE user_id = user_id;
  
  -- 6. Delete meetings
  DELETE FROM public.meetings WHERE user_id = user_id OR supplier_id = user_id;
  
  -- 7. Anonymize reviews (keep for business purposes but remove PII)
  UPDATE public.reviews 
  SET reviewer_id = null, title = null, content = 'Review from deleted user'
  WHERE reviewer_id = user_id;
  
  -- 8. Handle orders - anonymize but keep for legal/financial reasons
  UPDATE public.orders 
  SET client_id = null, 
      customer_name = 'Deleted User',
      customer_email = null,
      customer_phone = null,
      customer_phone_e164 = null
  WHERE client_id = user_id;
  
  -- Handle supplier orders
  UPDATE public.orders 
  SET supplier_id = null
  WHERE supplier_id = user_id;
  
  -- 9. Anonymize quotes but keep for business records
  UPDATE public.quotes 
  SET client_id = null
  WHERE client_id = user_id;
  
  UPDATE public.quotes 
  SET supplier_id = null
  WHERE supplier_id = user_id;
  
  -- 10. Handle leads - anonymize personal data
  UPDATE public.leads 
  SET client_id = null,
      name = 'Deleted User',
      contact_email = null,
      contact_phone = null
  WHERE client_id = user_id;
  
  UPDATE public.leads 
  SET supplier_id = null, assigned_to = null
  WHERE supplier_id = user_id OR assigned_to = user_id;
  
  -- 11. Delete companies owned by user (suppliers)
  DELETE FROM public.companies WHERE owner_id = user_id;
  
  -- 12. Delete products created by user
  DELETE FROM public.products WHERE supplier_id = user_id;
  
  -- 13. Clean up analytics and tracking data
  DELETE FROM public.user_analytics WHERE user_id = user_id;
  DELETE FROM public.onboarding_analytics WHERE user_id = user_id;
  DELETE FROM public.search_history WHERE user_id = user_id;
  
  -- 14. Finally, delete the user profile
  DELETE FROM public.profiles WHERE id = user_id;
  
  -- 15. Delete the auth user (this will cascade and clean up auth.users)
  -- Note: This needs to be done via the auth API, not directly in SQL
  -- The frontend will handle this part after the function returns successfully
  
END;
$$;