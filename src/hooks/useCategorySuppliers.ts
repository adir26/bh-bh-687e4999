import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/data/suppliers';

export const useCategorySuppliers = (categorySlug: string) => {
  return useQuery({
    queryKey: ['category-suppliers', categorySlug],
    queryFn: async () => {
      // Get category ID from slug
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (categoryError) throw categoryError;
      if (!category) return [];

      // Get companies in this category
      const { data: companyCategories, error: ccError } = await supabase
        .from('company_categories')
        .select('company_id')
        .eq('category_id', category.id);

      if (ccError) throw ccError;
      if (!companyCategories || companyCategories.length === 0) return [];

      const companyIds = companyCategories.map(cc => cc.company_id);

      // Get company details
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description, logo_url, phone, city, rating, review_count, slug')
        .in('id', companyIds)
        .eq('status', 'approved')
        .eq('is_public', true)
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (companiesError) throw companiesError;

      // Transform to Supplier format
      return companies.map((company): Supplier => ({
        id: company.id,
        name: company.name,
        tagline: company.description || '',
        logo: company.logo_url || '',
        category: categorySlug,
        rating: company.rating || 0,
        reviewCount: company.review_count || 0,
        phone: company.phone || '',
        location: company.city || '',
        description: company.description || '',
        slug: company.slug || '',
        services: [],
        gallery: [],
        products: [],
        reviews: []
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
