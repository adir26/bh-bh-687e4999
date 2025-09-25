import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

export function useCreateTestNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a sample notification for testing realtime
      const testNotification = {
        user_id: user.id,
        type: 'lead_new',
        title: 'התראה חדשה לבדיקה',
        message: 'זוהי התראה לבדיקת הפונקציונליות בזמן אמת',
        content: 'התראה זו נוצרה לצורך בדיקת התראות בזמן אמת',
        payload: { test: true, timestamp: new Date().toISOString() },
        is_read: false,
        priority: 'medium'
      };

      const { error } = await supabase
        .from('notifications')
        .insert(testNotification);

      if (error) throw error;
    },
    onSuccess: () => {
      showToast.success('התראת בדיקה נוצרה בהצלחה');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to create test notification:', error);
      showToast.error('שגיאה ביצירת התראת בדיקה');
    }
  });
}