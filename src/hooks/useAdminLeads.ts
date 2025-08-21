import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedLead,
  LeadFilters,
  PaginationParams,
  LeadsResponse,
  BulkActionResult,
  LeadHistory
} from '@/types/admin';

export const useAdminLeads = (
  filters: LeadFilters,
  pagination: PaginationParams
) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-leads', filters, pagination],
    queryFn: async (): Promise<LeadsResponse> => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          client_profile:profiles!client_id(*),
          supplier_profile:profiles!supplier_id(*),
          lead_activities(count)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      
      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      
      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          contact_email.ilike.%${filters.search}%,
          contact_phone.ilike.%${filters.search}%,
          lead_number.ilike.%${filters.search}%
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

      const { data: leads, error, count } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      const enhancedLeads: EnhancedLead[] = (leads as any)?.map((lead: any) => ({
        ...lead,
        activities_count: lead.lead_activities?.[0]?.count || 0
      })) || [];

      return {
        data: enhancedLeads,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    leads: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useLeadMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update lead status
  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס הליד עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating lead status:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הסטטוס',
        variant: 'destructive',
      });
    }
  });

  // Assign leads to supplier
  const assignLeads = useMutation({
    mutationFn: async ({ leadIds, supplierId }: { leadIds: string[]; supplierId: string }) => {
      const { data, error } = await supabase.rpc('admin_assign_leads', {
        _lead_ids: leadIds,
        _supplier_id: supplierId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast({
        title: 'הצלחה',
        description: `${count} לידים הוקצו בהצלחה`,
      });
    },
    onError: (error) => {
      console.error('Error assigning leads:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהקצאת הלידים',
        variant: 'destructive',
      });
    }
  });

  // Bulk update lead status
  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ leadIds, status }: { leadIds: string[]; status: string }) => {
      const { data, error } = await supabase.rpc('admin_update_lead_status', {
        _lead_ids: leadIds,
        _status: status
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast({
        title: 'הצלחה',
        description: `${count} לידים עודכנו בהצלחה`,
      });
    },
    onError: (error) => {
      console.error('Error bulk updating leads:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון המרובה',
        variant: 'destructive',
      });
    }
  });

  // Merge duplicate leads
  const mergeLeads = useMutation({
    mutationFn: async ({ primaryId, duplicateIds }: { primaryId: string; duplicateIds: string[] }) => {
      const { error } = await supabase.rpc('admin_merge_leads', {
        _primary_id: primaryId,
        _duplicate_ids: duplicateIds
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast({
        title: 'הצלחה',
        description: 'הלידים מוזגו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error merging leads:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה במיזוג הלידים',
        variant: 'destructive',
      });
    }
  });

  return {
    updateLeadStatus,
    assignLeads,
    bulkUpdateStatus,
    mergeLeads
  };
};

export const useLeadHistory = (leadId?: string) => {
  return useQuery({
    queryKey: ['lead-history', leadId],
    queryFn: async (): Promise<LeadHistory[]> => {
      const { data, error } = await supabase
        .from('lead_history')
        .select(`
          *,
          changed_by_profile:profiles!lead_history_changed_by_fkey(full_name)
        `)
        .eq('lead_id', leadId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId
  });
};

export const useAllSuppliers = () => {
  return useQuery({
    queryKey: ['all-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'supplier')
        .eq('is_blocked', false)
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Real-time subscriptions for lead updates
export const useLeadRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_history'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lead-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};