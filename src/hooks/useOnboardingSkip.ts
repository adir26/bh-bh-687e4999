import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, getRoleHomeRoute } from '@/utils/authRouting';

export const useOnboardingSkip = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const skipOnboarding = useCallback(async () => {
    if (!user || !profile) {
      toast.error('משתמש לא נמצא');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_skipped: true,
          onboarding_completed: false,
          onboarding_status: 'completed', // Mark as completed to prevent redirects
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      const userRole = (profile.role as UserRole) || 'client';
      const homeRoute = getRoleHomeRoute(userRole);
      
      toast.success('האונבורדינג דולג בהצלחה');
      navigate(homeRoute, { replace: true });
      
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error('שגיאה בדילוג על האונבורדינג');
    }
  }, [user, profile, navigate]);

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      toast.error('משתמש לא נמצא');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_skipped: false,
          onboarding_status: 'completed',
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      const userRole = (profile?.role as UserRole) || 'client';
      const homeRoute = getRoleHomeRoute(userRole);
      
      toast.success('האונבורדינג הושלם בהצלחה!');
      navigate(homeRoute, { replace: true });
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('שגיאה בהשלמת האונבורדינג');
    }
  }, [user, profile, navigate]);

  return {
    skipOnboarding,
    completeOnboarding
  };
};