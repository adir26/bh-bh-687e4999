import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Supplier } from '@/data/suppliers';

/**
 * Hook to fetch full supplier details for featured suppliers from CMS
 * @param supplierIds - Array of supplier IDs from CMS items
 */
export const useFeaturedSuppliers = (supplierIds: string[]) => {
  return useQuery({
    queryKey: ['featured-suppliers', supplierIds],
    queryFn: async () => {
      if (supplierIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('companies')
        .select('id, name, tagline, logo_url, slug, rating, review_count, phone, city, description, status, is_public')
        .in('id', supplierIds)
        .eq('status', 'approved')
        .eq('is_public', true);

      if (error) {
        console.error('Error fetching featured suppliers:', error);
        throw error;
      }

      // Convert to Supplier format and maintain order from CMS
      const suppliersMap = new Map(
        (data || []).map(company => [
          company.id,
          {
            id: company.id,
            name: company.name || '',
            tagline: company.tagline || '',
            logo: company.logo_url || '',
            category: '',
            rating: company.rating || 0,
            reviewCount: company.review_count || 0,
            phone: company.phone || '',
            location: company.city || '',
            description: company.description || '',
            slug: company.slug || company.id,
            services: [],
            gallery: [],
            products: [],
            reviews: []
          } as Supplier
        ])
      );

      // Return suppliers in the same order as the input IDs
      return supplierIds
        .map(id => suppliersMap.get(id))
        .filter((supplier): supplier is Supplier => supplier !== undefined);
    },
    enabled: supplierIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
