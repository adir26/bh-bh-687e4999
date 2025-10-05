import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Supplier {
  id: string;
  name: string;
  description?: string;
  city?: string;
  area?: string;
  logo_url?: string;
  rating?: number;
  review_count?: number;
  featured?: boolean;
}

interface SuppliersByCategory {
  category: Category;
  suppliers: Supplier[];
}

export const useLocalSuppliers = () => {
  const { user } = useAuth();

  // Fetch user's location from client_profiles
  const { data: userLocation } = useQuery({
    queryKey: ['user-location', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('client_profiles')
          .select('preferences')
          .eq('user_id', user!.id)
          .single();

        if (error) {
          console.error('[useLocalSuppliers] Error fetching user location:', error);
          return null;
        }

        // Extract city from streetAndBuilding
        const homeDetails = (data?.preferences as any)?.homeDetails;
        const address = homeDetails?.streetAndBuilding || '';
        
        // Simple city extraction - look for common city names
        const cities = ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'נתניה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'נתיבות', 'חולון', 'בני ברק', 'רמת גן', 'אשקלון', 'רחובות', 'בת ים', 'כפר סבא', 'הרצליה', 'חדרה', 'מודיעין', 'נצרת'];
        const foundCity = cities.find(city => address.includes(city));
        
        return {
          city: foundCity || null,
          fullAddress: address
        };
      } catch (error) {
        console.error('[useLocalSuppliers] Failed to fetch location:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch active categories
  const { data: categories = [] } = useQuery({
    queryKey: ['active-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, icon')
          .eq('is_active', true)
          .eq('is_public', true)
          .order('position', { ascending: true });

        if (error) {
          console.error('[useLocalSuppliers] Error fetching categories:', error);
          return [];
        }

        return data as Category[];
      } catch (error) {
        console.error('[useLocalSuppliers] Failed to fetch categories:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch suppliers by category and location
  const { 
    data: suppliersByCategory = [], 
    isLoading: suppliersLoading 
  } = useQuery({
    queryKey: ['local-suppliers', userLocation?.city, categories.map(c => c.id)],
    enabled: categories.length > 0,
    queryFn: async () => {
      try {
        const results: SuppliersByCategory[] = [];

        for (const category of categories) {
          // Build query
          let query = supabase
            .from('companies')
            .select(`
              id,
              name,
              description,
              city,
              area,
              logo_url,
              rating,
              review_count,
              featured
            `)
            .eq('status', 'approved')
            .eq('is_public', true);

          // Filter by category
          const { data: categoryCompanies } = await supabase
            .from('company_categories')
            .select('company_id')
            .eq('category_id', category.id);

          if (categoryCompanies && categoryCompanies.length > 0) {
            const companyIds = categoryCompanies.map(cc => cc.company_id);
            query = query.in('id', companyIds);
          } else {
            // No companies in this category
            continue;
          }

          // Filter by city if available
          if (userLocation?.city) {
            query = query.eq('city', userLocation.city);
          }

          // Order by featured first, then rating
          query = query.order('featured', { ascending: false })
                       .order('rating', { ascending: false, nullsFirst: false })
                       .limit(10);

          const { data: suppliers, error } = await query;

          if (error) {
            console.error(`[useLocalSuppliers] Error fetching suppliers for ${category.name}:`, error);
            continue;
          }

          if (suppliers && suppliers.length > 0) {
            results.push({
              category,
              suppliers: suppliers as Supplier[]
            });
          }
        }

        return results;
      } catch (error) {
        console.error('[useLocalSuppliers] Failed to fetch suppliers:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    userLocation,
    categories,
    suppliersByCategory,
    isLoading: suppliersLoading,
    hasLocation: !!userLocation?.city,
  };
};
