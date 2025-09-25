import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaUpdate } from '@/lib/supaFetch';
import { showToast } from '@/utils/toast';

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
  metadata?: Record<string, any>;
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      let supaQuery = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        supaQuery = supaQuery.eq('type', filters.type);
      }

      if (filters?.unread) {
        supaQuery = supaQuery.is('read_at', null);
      }

      const data = await supaSelect<Notification[]>(supaQuery, {
        errorMessage: 'שגיאה בטעינת התראות'
      });

      return data || [];
    },
    staleTime: 30_000, // 30 seconds
  });

  // Set up realtime subscription
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notification change:', payload);
            
            // Invalidate and refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            
            // Show toast for new notifications
            if (payload.eventType === 'INSERT' && payload.new) {
              const notification = payload.new as Notification;
              showToast.info(notification.title);
            }
          }
        )
        .subscribe();

      return channel;
    };

    let channelPromise = setupRealtime();

    return () => {
      channelPromise.then(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [queryClient]);

  return query;
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
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      showToast.error('שגיאה בסימון ההתראה כנקראה');
    }
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
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      showToast.success('כל ההתראות סומנו כנקראו');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      showToast.error('שגיאה בסימון כל ההתראות כנקראות');
    }
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