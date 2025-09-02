import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelectMaybe } from '@/lib/supaFetch';

export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async ({ signal }) => {
      const data = await supaSelectMaybe(
        supabase
          .from('profiles')
          .select(`
            id, 
            email, 
            full_name, 
            role, 
            onboarding_completed, 
            onboarding_status,
            onboarding_step, 
            onboarding_data,
            onboarding_version,
            onboarding_completed_at,
            first_login_at,
            last_login_at,
            onboarding_context, 
            last_onboarding_at, 
            created_at, 
            updated_at
          `)
          .eq('id', userId!),
        { 
          signal,
          errorMessage: 'שגיאה בטעינת פרופיל המשתמש',
          timeoutMs: 10_000
        }
      );
      
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });
}