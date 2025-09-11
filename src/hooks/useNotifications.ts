import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaUpdate } from '@/lib/supaFetch';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  content: string;
  payload: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  action_url?: string;
  priority?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_opt_in: boolean;
  push_opt_in: boolean;
  categories: {
    leads: boolean;
    quotes: boolean;
    orders: boolean;
    reviews: boolean;
  };
  system: boolean;
  orders: boolean;
  marketing: boolean;
}

export function useNotifications(filters?: { type?: string; unread?: boolean }) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.unread) {
        query = query.is('read_at', null);
      }

      const data = await supaSelect<Notification[]>(query, {
        errorMessage: 'שגיאה בטעינת התראות'
      });

      return data || [];
    },
    staleTime: 30_000, // 30 seconds
  });
}

export function useNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null);

      return count || 0;
    },
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const data = await supaSelect<NotificationPreferences>(
        supabase
          .from('notification_preferences')
          .select('*')
          .single(),
        {
          errorMessage: 'שגיאה בטעינת העדפות התראות'
        }
      );

      return data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        user_id: user.id,
        ...preferences
      };

      const data = await supaUpdate<NotificationPreferences>(
        supabase
          .from('notification_preferences')
          .upsert(updateData)
          .select()
          .single(),
        {
          errorMessage: 'שגיאה בעדכון העדפות התראות'
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}