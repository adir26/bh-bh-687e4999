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
          .select('*')
          .eq('id', userId!),
        { 
          signal,
          errorMessage: 'שגיאה בטעינת פרופיל המשתמש'
        }
      );
      
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });
}