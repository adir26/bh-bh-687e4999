import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

export interface NotificationSettings {
  system: boolean;
  orders: boolean; 
  marketing: boolean;
}

export const useNotificationPermissions = () => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [isLoading, setIsLoading] = useState(false);
  
  // Default settings - ALL OFF per App Store guidelines  
  const [settings, setSettings] = useState<NotificationSettings>({
    system: false,    // System notifications (critical)
    orders: false,    // Order/business notifications  
    marketing: false  // Marketing notifications (explicit opt-in required)
  });

  // Check initial permission state and load preferences
  useEffect(() => {
    checkPermissionState();
    loadPreferences();
  }, []);

  const checkPermissionState = useCallback(async () => {
    try {
      if ('Notification' in window) {
        const permission = Notification.permission as NotificationPermissionState;
        setPermissionState(permission);
        
        // If permission was previously denied, ensure notifications are handled properly
        if (permission === 'denied') {
          // We maintain the preferences but they won't work for push notifications
          console.log('Notification permission denied by user');
        }
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "לא נתמך",
        description: "הדפדפן שלך לא תומך בהתראות.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as NotificationPermissionState);
      
      if (permission === 'granted') {
        toast({
          title: "הרשאה ניתנה",
          description: "כעת תוכל להגדיר העדפות התראות.",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "הרשאה נדחתה",
          description: "לא תוכל לקבל התראות דחופות. ניתן לשנות בהגדרות הדפדפן.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בבקשת הרשאה.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }

    return false;
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setSettings({
          system: data.system,
          orders: data.orders,
          marketing: data.marketing
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  const savePreferences = useCallback(async (newSettings: NotificationSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "עליך להתחבר כדי לשמור העדפות.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.rpc('set_notification_pref', {
        p_system: newSettings.system,
        p_orders: newSettings.orders,
        p_marketing: newSettings.marketing
      });

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לשמור את ההעדפות.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת ההעדפות.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const updateSetting = useCallback(async (
    category: keyof NotificationSettings,
    enabled: boolean
  ) => {
    // Block if no permission for system/orders notifications
    if ((category === 'system' || category === 'orders') && permissionState !== 'granted' && enabled) {
      toast({
        title: "הרשאה נדרשת",
        description: "עליך לאשר התראות בדפדפן כדי לקבל התראות.",
        variant: "destructive"
      });
      return;
    }

    const newSettings = {
      ...settings,
      [category]: enabled
    };
    
    setSettings(newSettings);
    
    // Save to backend
    const saved = await savePreferences(newSettings);
    if (saved) {
      toast({
        title: "נשמר",
        description: "ההעדפות שלך נשמרו בהצלחה.",
      });
    }
  }, [permissionState, settings, savePreferences]);

  const openSystemSettings = useCallback(() => {
    // For web - guide user to browser settings
    toast({
      title: "הגדרות דפדפן",
      description: "עבור להגדרות הדפדפן כדי לאפשר התראות.",
    });
  }, []);

  return {
    permissionState,
    settings,
    isLoading,
    requestPermission,
    updateSetting,
    openSystemSettings,
    checkPermissionState,
    loadPreferences,
    savePreferences,
    hasPermission: permissionState === 'granted',
    isBlocked: permissionState === 'denied'
  };
};