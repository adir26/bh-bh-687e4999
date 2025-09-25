-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create function to create sample notifications for testing
CREATE OR REPLACE FUNCTION public.create_sample_notifications(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert sample notifications
  INSERT INTO public.notifications (user_id, type, title, message, content, payload, is_read, priority, created_at) VALUES
  (target_user_id, 'lead_new', 'לקוח חדש מעוניין', 'לקוח חדש פנה אליך לגבי שיפוץ מטבח', 'לקוח חדש פנה אליך לגבי שיפוץ מטבח במרכז תל אביב', '{"lead_id": "sample-lead-1", "client_name": "יוסי כהן"}', false, 'high', NOW() - INTERVAL '5 minutes'),
  (target_user_id, 'quote_accepted', 'הצעת מחיר אושרה!', 'הצעת המחיר שלך לפרויקט עיצוב סלון אושרה', 'הלקוח אישר את הצעת המחיר בסך 15,000 ש"ח לעיצוב סלון', '{"quote_id": "sample-quote-1", "amount": 15000}', false, 'high', NOW() - INTERVAL '1 hour'),
  (target_user_id, 'order_status_change', 'הזמנה עודכנה', 'ההזמנה מס\'' 12345 עברה לשלב הייצור', 'ההזמנה של עיצוב חדר שינה עברה לשלב הייצור', '{"order_id": "sample-order-1", "status": "in_progress"}', true, 'medium', NOW() - INTERVAL '2 hours'),
  (target_user_id, 'review_new', 'ביקורת חדשה התקבלה', 'קיבלת ביקורת חדשה עם 5 כוכבים', 'לקוח נתן לך ביקורת מעולה עם 5 כוכבים על השירות', '{"review_id": "sample-review-1", "rating": 5}', true, 'low', NOW() - INTERVAL '1 day'),
  (target_user_id, 'quote_viewed', 'הצעת מחיר נצפתה', 'הלקוח צפה בהצעת המחיר שלך', 'הצעת המחיר לשיפוץ אמבטיה נצפתה על ידי הלקוח', '{"quote_id": "sample-quote-2"}', false, 'low', NOW() - INTERVAL '30 minutes');
END;
$$;