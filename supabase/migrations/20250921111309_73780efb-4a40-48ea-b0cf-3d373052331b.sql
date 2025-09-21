-- Create comprehensive user account deletion function
-- This function purges all user data from the database

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.delete_user_account_db(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, app_private
AS $$
BEGIN
  -- Delete user-owned data in dependency order (children first, then parents)
  
  -- 1. Delete activity and log tables
  DELETE FROM onboarding_analytics WHERE user_id = p_user_id;
  DELETE FROM company_analytics WHERE company_id IN (
    SELECT id FROM companies WHERE owner_id = p_user_id
  );
  DELETE FROM audit_logs WHERE user_id = p_user_id;
  
  -- 2. Delete photo-related data
  DELETE FROM photo_tags WHERE photo_id IN (
    SELECT id FROM photos WHERE uploader_id = p_user_id
  );
  DELETE FROM photo_likes WHERE user_id = p_user_id;
  DELETE FROM photos WHERE uploader_id = p_user_id;
  
  -- 3. Delete ideabook-related data
  DELETE FROM ideabook_photos WHERE ideabook_id IN (
    SELECT id FROM ideabooks WHERE owner_id = p_user_id
  );
  DELETE FROM ideabook_photos WHERE added_by = p_user_id;
  DELETE FROM ideabook_collaborators WHERE user_id = p_user_id;
  DELETE FROM ideabook_collaborators WHERE ideabook_id IN (
    SELECT id FROM ideabooks WHERE owner_id = p_user_id
  );
  DELETE FROM ideabooks WHERE owner_id = p_user_id;
  
  -- 4. Delete order-related data
  DELETE FROM order_events WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM order_messages WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM order_files WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM order_attachments WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM order_items WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM payment_links WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM refunds WHERE order_id IN (
    SELECT id FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM orders WHERE client_id = p_user_id OR supplier_id = p_user_id;
  
  -- 5. Delete quote and proposal related data
  DELETE FROM signature_links WHERE proposal_id IN (
    SELECT p.id FROM proposals p 
    JOIN quotes q ON q.id = p.quote_id 
    WHERE q.client_id = p_user_id OR q.supplier_id = p_user_id
  );
  DELETE FROM proposal_events WHERE proposal_id IN (
    SELECT p.id FROM proposals p 
    JOIN quotes q ON q.id = p.quote_id 
    WHERE q.client_id = p_user_id OR q.supplier_id = p_user_id
  );
  DELETE FROM proposals WHERE quote_id IN (
    SELECT id FROM quotes WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM quote_items WHERE quote_id IN (
    SELECT id FROM quotes WHERE client_id = p_user_id OR supplier_id = p_user_id
  );
  DELETE FROM quotes WHERE client_id = p_user_id OR supplier_id = p_user_id;
  
  -- 6. Delete lead-related data
  DELETE FROM lead_activities WHERE lead_id IN (
    SELECT id FROM leads WHERE client_id = p_user_id OR supplier_id = p_user_id OR assigned_to = p_user_id
  );
  DELETE FROM lead_history WHERE lead_id IN (
    SELECT id FROM leads WHERE client_id = p_user_id OR supplier_id = p_user_id OR assigned_to = p_user_id
  );
  DELETE FROM leads WHERE client_id = p_user_id OR supplier_id = p_user_id OR assigned_to = p_user_id;
  
  -- 7. Delete ticket-related data
  DELETE FROM ticket_messages WHERE ticket_id IN (
    SELECT id FROM tickets WHERE opened_by = p_user_id OR assigned_to = p_user_id
  );
  DELETE FROM tickets WHERE opened_by = p_user_id OR assigned_to = p_user_id;
  
  -- 8. Delete support tickets
  DELETE FROM support_tickets WHERE user_id = p_user_id OR assigned_to = p_user_id;
  
  -- 9. Delete reviews (keep content but anonymize - as per business requirements)
  UPDATE reviews 
  SET reviewer_id = NULL, 
      title = 'Review from deleted user',
      content = 'Review from deleted user'
  WHERE reviewer_id = p_user_id;
  
  -- Delete reviews where user is the reviewed entity
  DELETE FROM reviews WHERE reviewed_id = p_user_id;
  
  -- 10. Delete company-related data (if user is supplier)
  DELETE FROM products WHERE supplier_id = p_user_id;
  DELETE FROM companies WHERE owner_id = p_user_id;
  
  -- 11. Delete favorites and user preferences
  DELETE FROM favorites WHERE user_id = p_user_id;
  DELETE FROM user_favorites WHERE user_id = p_user_id;
  DELETE FROM notification_preferences WHERE user_id = p_user_id;
  
  -- 12. Delete event logs
  DELETE FROM events WHERE user_id = p_user_id;
  
  -- 13. Delete admin-related data if user is admin
  DELETE FROM admin_audit_logs WHERE admin_id = p_user_id;
  DELETE FROM admin_credentials WHERE user_id = p_user_id;
  
  -- 14. Finally, delete the main profile record
  DELETE FROM profiles WHERE id = p_user_id;
  
  -- Log the deletion for audit purposes (non-PII)
  INSERT INTO audit_logs (
    table_name, operation, user_id, record_id,
    old_values, new_values, changed_fields,
    created_at
  ) VALUES (
    'account_deletion', 'DELETE', NULL, p_user_id,
    jsonb_build_object(
      'timestamp', now(), 
      'audit_id', 'deleted_' || substring(p_user_id::text, 1, 8) || '_' || extract(epoch from now())::text
    ),
    NULL, NULL, now()
  );
  
END;
$$;