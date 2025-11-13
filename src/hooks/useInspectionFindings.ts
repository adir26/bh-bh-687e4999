import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';

export interface InspectionFinding {
  id: number;
  category: string;
  sub_category: string;
  finding_name: string;
  finding_description: string;
  defect_type: string;
  severity_suggested: number;
  created_at: string;
}

export function useInspectionFindings(category?: string, subCategory?: string, search?: string) {
  return useQuery({
    queryKey: ['inspection-findings-catalog', category, subCategory, search],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_findings_catalog' as any)
        .select('*')
        .order('finding_name');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (subCategory && subCategory !== 'all') {
        query = query.eq('sub_category', subCategory);
      }

      if (search && search.trim()) {
        query = query.or(`finding_name.ilike.%${search}%,finding_description.ilike.%${search}%`);
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
        .from('inspection_findings_catalog' as any)
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

export function useInspectionFindingSubCategories(category?: string) {
  return useQuery({
    queryKey: ['inspection-finding-subcategories', category],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_findings_catalog' as any)
        .select('sub_category')
        .order('sub_category');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const data = await supaSelect<{ sub_category: string }[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת תתי קטגוריות',
      });

      // Get unique sub-categories
      const uniqueSubCategories = [...new Set(data.map(d => d.sub_category))];
      return uniqueSubCategories;
    },
    enabled: !!category && category !== 'all',
  });
}
