import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  supplier_count?: number;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Fetch active categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('position', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch supplier counts for each category
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category) => {
          const { count } = await supabase
            .from('company_categories')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            supplier_count: count || 0,
          };
        })
      );

      return categoriesWithCounts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePopularCategories = (limit: number = 6) => {
  const { data: allCategories, ...rest } = useCategories();
  
  return {
    ...rest,
    data: allCategories?.slice(0, limit),
  };
};
