import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAppEvents = () => {
  const { user, profile } = useAuth();

  const logEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    if (!user) return;

    try {
      await supabase.from('app_events').insert({
        user_id: user.id,
        role: profile?.role || 'client',
        event_name: eventName,
        metadata,
        occurred_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  };

  return { logEvent };
};
