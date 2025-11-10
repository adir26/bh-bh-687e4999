import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';

export interface Standard {
  id: string;
  domain: string;
  category: string;
  title: string;
  description?: string;
  standard_code?: string;
  standard_clause?: string;
  standard_quote?: string;
  default_severity?: 'low' | 'medium' | 'high';
  created_at: string;
}

export function useStandardsLibrary(search?: string, category?: string) {
  return useQuery({
    queryKey: ['standards-library', search, category],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('standards_library')
        .select('*')
        .order('title');

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const data = await supaSelect<Standard[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת תקנים',
      });

      return data;
    },
  });
}

export function useStandardCategories() {
  return useQuery({
    queryKey: ['standard-categories'],
    queryFn: async ({ signal }) => {
      const query = supabase
        .from('standards_library')
        .select('category')
        .order('category');

      const data = await supaSelect<{ category: string }[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת קטגוריות',
      });

      // Get unique categories
      const uniqueCategories = [...new Set(data.map(d => d.category))];
      return uniqueCategories;
    },
  });
}
