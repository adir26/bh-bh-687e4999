import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedCategory,
  CategoryFilters,
  PaginationParams,
  CategoriesResponse,
  CategoryInsert,
  CategoryUpdate
} from '@/types/admin';

export const useAdminCategories = (
  filters: CategoryFilters,
  pagination: PaginationParams
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories with pagination and filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-categories', filters, pagination],
    queryFn: async (): Promise<CategoriesResponse> => {
      let query = supabase
        .from('categories')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (typeof filters.is_active === 'boolean') {
        query = query.eq('is_active', filters.is_active);
      }
      
      if (typeof filters.is_public === 'boolean') {
        query = query.eq('is_public', filters.is_public);
      }
      
      if (filters.parent_id !== undefined) {
        if (filters.parent_id === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parent_id);
        }
      }

      // Apply pagination and ordering
      query = query
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      const { data: categories, error, count } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Get counts for each category
      const categoryIds = categories?.map(c => c.id) || [];
      let supplierCounts: Record<string, number> = {};
      let productCounts: Record<string, number> = {};
      
      if (categoryIds.length > 0) {
        // Get supplier counts via company_categories
        const { data: companyCats } = await supabase
          .from('company_categories')
          .select('category_id')
          .in('category_id', categoryIds);
        
        supplierCounts = companyCats?.reduce((acc, cc) => {
          acc[cc.category_id] = (acc[cc.category_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Get product counts via product_categories
        const { data: productCats } = await supabase
          .from('product_categories')
          .select('category_id')
          .in('category_id', categoryIds);
        
        productCounts = productCats?.reduce((acc, pc) => {
          acc[pc.category_id] = (acc[pc.category_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
      }

      // Get child categories for hierarchical display
      const childCategoriesPromises = categories?.map(async (category) => {
        const { data: children } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', category.id)
          .order('position', { ascending: true });
        
        return children || [];
      }) || [];

      const childCategoriesArrays = await Promise.all(childCategoriesPromises);

      const enhancedCategories: EnhancedCategory[] = categories?.map((category, index) => ({
        ...category,
        supplier_count: supplierCounts[category.id] || 0,
        product_count: productCounts[category.id] || 0,
        children: childCategoriesArrays[index] || []
      })) || [];

      return {
        data: enhancedCategories,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    categories: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useCategoryMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create category
  const createCategory = useMutation({
    mutationFn: async (categoryData: Omit<CategoryInsert, 'id' | 'created_at'>) => {
      // Generate slug from name if not provided
      const slug = categoryData.slug || categoryData.name
        .toLowerCase()
        .replace(/[^\u0590-\u05FF\w\s-]/g, '') // Allow Hebrew, alphanumeric, spaces, hyphens
        .replace(/\s+/g, '-')
        .trim();

      const { data, error } = await supabase
        .from('categories')
        .insert({ ...categoryData, slug })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'הצלחה',
        description: 'הקטגוריה נוצרה בהצלחה',
      });
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      const message = error.code === '23505' ? 'שם הקטגוריה כבר קיים' : 'אירעה שגיאה ביצירת הקטגוריה';
      toast({
        title: 'שגיאה',
        description: message,
        variant: 'destructive',
      });
    }
  });

  // Update category
  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
      // Generate slug from name if name is being updated and slug is not provided
      if (updates.name && !updates.slug) {
        updates.slug = updates.name
          .toLowerCase()
          .replace(/[^\u0590-\u05FF\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'הצלחה',
        description: 'הקטגוריה עודכנה בהצלחה',
      });
    },
    onError: (error: any) => {
      console.error('Error updating category:', error);
      const message = error.code === '23505' ? 'שם הקטגוריה כבר קיים' : 'אירעה שגיאה בעדכון הקטגוריה';
      toast({
        title: 'שגיאה',
        description: message,
        variant: 'destructive',
      });
    }
  });

  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      // Check if category has children or associated products/companies
      const [childrenResult, productsResult, companiesResult] = await Promise.all([
        supabase.from('categories').select('id').eq('parent_id', id).limit(1),
        supabase.from('product_categories').select('id').eq('category_id', id).limit(1),
        supabase.from('company_categories').select('id').eq('category_id', id).limit(1)
      ]);

      if (childrenResult.data && childrenResult.data.length > 0) {
        throw new Error('לא ניתן למחוק קטגוריה עם תתי-קטגוריות');
      }
      
      if (productsResult.data && productsResult.data.length > 0) {
        throw new Error('לא ניתן למחוק קטגוריה עם מוצרים משויכים');
      }
      
      if (companiesResult.data && companiesResult.data.length > 0) {
        throw new Error('לא ניתן למחוק קטגוריה עם ספקים משויכים');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'הצלחה',
        description: 'הקטגוריה נמחקה בהצלחה',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting category:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'אירעה שגיאה במחיקת הקטגוריה',
        variant: 'destructive',
      });
    }
  });

  // Reorder categories
  const reorderCategories = useMutation({
    mutationFn: async (categories: Array<{ id: string; position: number }>) => {
      const updates = categories.map(async ({ id, position }) => {
        return supabase
          .from('categories')
          .update({ position })
          .eq('id', id);
      });

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('אירעה שגיאה בסידור מחדש של הקטגוריות');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'הצלחה',
        description: 'סדר הקטגוריות עודכן בהצלחה',
      });
    },
    onError: (error: any) => {
      console.error('Error reordering categories:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בסידור מחדש של הקטגוריות',
        variant: 'destructive',
      });
    }
  });

  // Admin reorder categories RPC
  const reorderCategoriesRPC = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const { error } = await supabase.rpc('admin_reorder_categories', {
        _ids: categoryIds
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'הצלחה',
        description: 'סדר הקטגוריות עודכן בהצלחה',
      });
    },
    onError: (error: any) => {
      console.error('Error reordering categories via RPC:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בסידור מחדש של הקטגוריות',
        variant: 'destructive',
      });
    }
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    reorderCategoriesRPC
  };
};

// Get all categories for dropdowns/selects
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .eq('is_active', true)
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Real-time subscriptions for category updates
export const useCategoryRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Import and check ADMIN_REALTIME_ENABLED
    import('@/config/adminFlags').then(({ ADMIN_REALTIME_ENABLED }) => {
      if (!ADMIN_REALTIME_ENABLED) return;
      
      const channel = supabase
      .channel('admin-categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
          queryClient.invalidateQueries({ queryKey: ['all-categories'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_categories'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_categories'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }
      )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient]);
};