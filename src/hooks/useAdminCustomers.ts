import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedProfile,
  CustomerFilters,
  PaginationParams,
  CustomersResponse,
  ComplaintWithDetails,
  BulkActionResult
} from '@/types/admin';

export const useAdminCustomers = (
  filters: CustomerFilters,
  pagination: PaginationParams
) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-customers', filters, pagination],
    queryFn: async (): Promise<CustomersResponse> => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          orders:orders(count),
          support_tickets:support_tickets(count)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status === 'blocked') {
        query = query.eq('is_blocked', true);
      } else if (filters.status === 'active') {
        query = query.eq('is_blocked', false);
      }
      
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.search) {
        query = query.or(`
          full_name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%
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

      const { data: profiles, error, count } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      const enhancedProfiles: EnhancedProfile[] = profiles?.map(profile => ({
        ...profile,
        orders_count: profile.orders?.[0]?.count || 0,
        complaints_count: profile.support_tickets?.[0]?.count || 0,
        last_login: profile.updated_at // Approximate last activity
      })) || [];

      return {
        data: enhancedProfiles,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    customers: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useCustomerMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Block/Unblock customer
  const toggleCustomerBlock = useMutation({
    mutationFn: async ({ 
      id, 
      block, 
      reason 
    }: { 
      id: string; 
      block: boolean; 
      reason?: string; 
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_blocked: block,
          blocked_at: block ? new Date().toISOString() : null,
          blocked_by: block ? adminId : null,
          block_reason: block ? reason : null
        })
        .eq('id', id);
      
      if (error) throw error;

      // Log audit action
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId!,
        entity_type: 'profile',
        entity_id: id,
        action: block ? 'block' : 'unblock',
        metadata: { reason }
      });
    },
    onSuccess: (_, { block }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast({
        title: 'הצלחה',
        description: block ? 'המשתמש נחסם בהצלחה' : 'המשתמש שוחרר מחסימה',
      });
    },
    onError: (error) => {
      console.error('Error toggling customer block:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון סטטוס החסימה',
        variant: 'destructive',
      });
    }
  });

  return {
    toggleCustomerBlock
  };
};

export const useCustomerComplaints = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-complaints', customerId],
    queryFn: async (): Promise<ComplaintWithDetails[]> => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user_profile:profiles(*),
          order:orders(*)
        `);

      if (customerId) {
        query = query.eq('user_id', customerId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!customerId
  });
};

export const useComplaintMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateComplaintStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      admin_notes 
    }: { 
      id: string; 
      status: string; 
      admin_notes?: string; 
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;

      const updates: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (admin_notes) {
        updates.admin_notes = admin_notes;
      }

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = adminId;
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;

      // Log audit action
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId!,
        entity_type: 'complaint',
        entity_id: id,
        action: 'status_update',
        metadata: { status, notes: admin_notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-complaints'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס התלונה עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating complaint:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון התלונה',
        variant: 'destructive',
      });
    }
  });

  return {
    updateComplaintStatus
  };
};

// Real-time subscriptions for customer updates
export const useCustomerRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customer-complaints'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};