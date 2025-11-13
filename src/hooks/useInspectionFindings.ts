import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';

export interface InspectionFinding {
  id: string;
  category: string;
  finding: string;
  description: string;
  created_at: string;
}

export function useInspectionFindings(category?: string, search?: string) {
  return useQuery({
    queryKey: ['inspection-findings', category, search],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_findings')
        .select('*')
        .order('finding');

      if (category) {
        query = query.eq('category', category);
      }

      if (search && search.trim()) {
        query = query.or(`finding.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const data = await supaSelect<InspectionFinding[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת ממצאים',
      });

      return data;
    },
  });
}

export function useInspectionFindingCategories() {
  return useQuery({
    queryKey: ['inspection-finding-categories'],
    queryFn: async ({ signal }) => {
      const query = supabase
        .from('inspection_findings')
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
    staleTime: 0,
    refetchOnMount: true,
  });
}
