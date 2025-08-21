import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedCompany,
  SupplierFilters,
  PaginationParams,
  SuppliersResponse,
  BulkActionResult,
  SupplierVerification
} from '@/types/admin';

export const useAdminSuppliers = (
  filters: SupplierFilters,
  pagination: PaginationParams
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suppliers with pagination and filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-suppliers', filters, pagination],
    queryFn: async (): Promise<SuppliersResponse> => {
      let query = supabase
        .from('companies')
        .select(`
          *,
          owner_profile:profiles!companies_owner_id_fkey(id, full_name, email),
          categories:company_categories(
            category:categories(id, name)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }
      
      if (typeof filters.is_public === 'boolean') {
        query = query.eq('is_public', filters.is_public);
      }
      
      if (typeof filters.featured === 'boolean') {
        query = query.eq('featured', filters.featured);
      }
      
      if (filters.area) {
        query = query.ilike('area', `%${filters.area}%`);
      }
      
      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%,
          phone.ilike.%${filters.search}%,
          owner_profile.full_name.ilike.%${filters.search}%,
          owner_profile.email.ilike.%${filters.search}%
        `);
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      query = query
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .order('created_at', { ascending: false });

      const { data: companies, error, count } = await query;

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      // Get product counts for each company
      const companyIds = companies?.map(c => c.id) || [];
      let productCounts: Record<string, number> = {};
      
      if (companyIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('supplier_id, company_id')
          .in('company_id', companyIds);
        
        productCounts = products?.reduce((acc, product) => {
          const key = product.company_id || product.supplier_id;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
      }

      const enhancedCompanies: EnhancedCompany[] = companies?.map(company => ({
        ...company,
        product_count: productCounts[company.id] || 0
      })) || [];

      return {
        data: enhancedCompanies,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    suppliers: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useSupplierMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update supplier status
  const updateSupplierStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס הספק עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating supplier status:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הסטטוס',
        variant: 'destructive',
      });
    }
  });

  // Update supplier visibility
  const updateSupplierVisibility = useMutation({
    mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_public })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast({
        title: 'הצלחה',
        description: 'נראות הספק עודכנה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating supplier visibility:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הנראות',
        variant: 'destructive',
      });
    }
  });

  // Update verification status
  const updateVerificationStatus = useMutation({
    mutationFn: async ({ 
      id, 
      verification_status, 
      verification_notes 
    }: { 
      id: string; 
      verification_status: string; 
      verification_notes?: string; 
    }) => {
      const { error } = await supabase
        .from('companies')
        .update({ 
          verification_status,
          verification_notes,
          verified_at: verification_status === 'verified' ? new Date().toISOString() : null,
          verified_by: verification_status === 'verified' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס האימות עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating verification status:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון סטטוס האימות',
        variant: 'destructive',
      });
    }
  });

  // Bulk update suppliers
  const bulkUpdateSuppliers = useMutation({
    mutationFn: async ({ 
      ids, 
      updates 
    }: { 
      ids: string[]; 
      updates: Partial<{ status: string; is_public: boolean; featured: boolean; verification_status: string }>;
    }): Promise<BulkActionResult> => {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const id of ids) {
        try {
          const { error } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', id);
          
          if (error) throw error;
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Failed to update ${id}: ${error}`);
        }
      }

      return { success: successCount, failed: failedCount, errors };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      toast({
        title: 'הושלם',
        description: `עודכנו ${result.success} ספקים בהצלחה${result.failed > 0 ? `, ${result.failed} נכשלו` : ''}`,
      });
    },
    onError: (error) => {
      console.error('Error bulk updating suppliers:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון המרובה',
        variant: 'destructive',
      });
    }
  });

  return {
    updateSupplierStatus,
    updateSupplierVisibility,
    updateVerificationStatus,
    bulkUpdateSuppliers
  };
};

export const useSupplierVerifications = (companyId: string) => {
  return useQuery({
    queryKey: ['supplier-verifications', companyId],
    queryFn: async (): Promise<SupplierVerification[]> => {
      const { data, error } = await supabase
        .from('supplier_verifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });
};

// Real-time subscriptions for supplier updates
export const useSupplierRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-suppliers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_verifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
          queryClient.invalidateQueries({ queryKey: ['supplier-verifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};