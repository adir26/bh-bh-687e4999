import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

export interface NotificationSettings {
  // Transactional (critical business notifications)
  orderUpdates: { push: boolean; email: boolean; sms: boolean };
  quoteResponses: { push: boolean; email: boolean; sms: boolean };
  paymentConfirmations: { push: boolean; email: boolean; sms: boolean };
  supportMessages: { push: boolean; email: boolean; sms: boolean };
  
  // Marketing (requires separate opt-in)
  promotions: { push: boolean; email: boolean; sms: boolean };
  newFeatures: { push: boolean; email: boolean; sms: boolean };
  newsletters: { push: boolean; email: boolean; sms: boolean };
}

export const useNotificationPermissions = () => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [isLoading, setIsLoading] = useState(false);
  
  // Default settings - ALL OFF per App Store guidelines
  const [settings, setSettings] = useState<NotificationSettings>({
    // Transactional - OFF by default until permission granted
    orderUpdates: { push: false, email: false, sms: false },
    quoteResponses: { push: false, email: false, sms: false },
    paymentConfirmations: { push: false, email: false, sms: false },
    supportMessages: { push: false, email: false, sms: false },
    
    // Marketing - MUST remain OFF until explicit opt-in
    promotions: { push: false, email: false, sms: false },
    newFeatures: { push: false, email: false, sms: false },
    newsletters: { push: false, email: false, sms: false },
  });

  // Check initial permission state
  useEffect(() => {
    checkPermissionState();
  }, []);

  const checkPermissionState = useCallback(async () => {
    try {
      if ('Notification' in window) {
        const permission = Notification.permission as NotificationPermissionState;
        setPermissionState(permission);
        
        // If permission was previously denied, ensure all push notifications are off
        if (permission === 'denied') {
          setSettings(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              updated[key as keyof NotificationSettings].push = false;
            });
            return updated;
          });
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

  const updateSetting = useCallback((
    category: keyof NotificationSettings,
    channel: 'push' | 'email' | 'sms',
    enabled: boolean
  ) => {
    // Block push notifications if permission not granted
    if (channel === 'push' && permissionState !== 'granted' && enabled) {
      toast({
        title: "הרשאה נדרשת",
        description: "עליך לאשר התראות בדפדפן כדי לקבל התראות דחופות.",
        variant: "destructive"
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: enabled
      }
    }));
  }, [permissionState]);

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
    hasPermission: permissionState === 'granted',
    isBlocked: permissionState === 'denied'
  };
};