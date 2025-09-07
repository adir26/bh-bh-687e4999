import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicSupplier {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  area?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  review_count: number;
  verified: boolean;
  slug: string;
}

export interface PublicProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
}

export const usePublicSupplier = (slug: string) => {
  return useQuery({
    queryKey: ['public-supplier', slug],
    queryFn: async (): Promise<PublicSupplier | null> => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          description,
          logo_url,
          address,
          city,
          area,
          phone,
          email,
          website,
          rating,
          review_count,
          verified,
          slug
        `)
        .eq('slug', slug)
        .eq('is_public', true)
        .eq('status', 'approved')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No results found
        }
        throw error;
      }

      return data;
    },
    enabled: !!slug,
  });
};

export const usePublicSupplierProducts = (supplierId: string, options?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) => {
  const page = options?.page || 1;
  const limit = options?.limit || 12;
  const search = options?.search;
  const categoryId = options?.categoryId;

  return useQuery({
    queryKey: ['public-supplier-products', supplierId, page, limit, search, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          currency,
          images,
          category:categories(id, name)
        `)
        .eq('supplier_id', supplierId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * limit,
      };
    },
    enabled: !!supplierId,
  });
};

export const usePublicProduct = (productId: string) => {
  return useQuery({
    queryKey: ['public-product', productId],
    queryFn: async (): Promise<PublicProduct | null> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          currency,
          images,
          category:categories(id, name)
        `)
        .eq('id', productId)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!productId,
  });
};

export const useSupplierCategories = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-categories', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          product_categories!inner(
            products!inner(
              id,
              supplier_id,
              is_published
            )
          )
        `)
        .eq('product_categories.products.supplier_id', supplierId)
        .eq('product_categories.products.is_published', true)
        .eq('is_active', true);

      if (error) throw error;

      // Remove duplicates and flatten
      const uniqueCategories = data?.reduce((acc: any[], category) => {
        const existing = acc.find(c => c.id === category.id);
        if (!existing) {
          acc.push({
            id: category.id,
            name: category.name,
          });
        }
        return acc;
      }, []) || [];

      return uniqueCategories;
    },
    enabled: !!supplierId,
  });
};