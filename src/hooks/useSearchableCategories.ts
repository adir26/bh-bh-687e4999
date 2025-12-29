import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchableCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export const useSearchableCategories = () => {
  return useQuery({
    queryKey: ['searchable-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data || []) as SearchableCategory[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
