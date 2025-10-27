import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchableCompany {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  rating: number | null;
  review_count: number | null;
  city: string | null;
  area: string | null;
  company_categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }> | null;
}

export const useSearchableCompanies = () => {
  return useQuery({
    queryKey: ['searchable-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          slug,
          tagline,
          description,
          logo_url,
          rating,
          review_count,
          city,
          area,
          company_categories(
            category:categories(
              id,
              name,
              slug
            )
          )
        `)
        .eq('status', 'approved')
        .eq('is_public', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return (data || []) as SearchableCompany[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
