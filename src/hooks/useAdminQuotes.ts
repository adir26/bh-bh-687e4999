import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Quote = Database['public']['Tables']['quotes']['Row'];

export interface QuoteFilters {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface EnhancedQuote extends Quote {
  client?: { full_name: string | null; email: string | null } | null;
  supplier?: { full_name: string | null; email: string | null } | null;
  items_count?: number;
}

export const useAdminQuotes = (filters: QuoteFilters, pagination: PaginationParams) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-quotes', filters, pagination],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`
          quote_number.ilike.%${filters.search}%,
          title.ilike.%${filters.search}%
        `);
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Pagination and ordering
      query = query
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .order('created_at', { ascending: false });

      const { data: quotes, error, count } = await query;
      
      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      // Get item counts and profile data for each quote
      const quotesWithCounts = await Promise.all(
        (quotes || []).map(async (quote: any) => {
          const { count: itemCount } = await supabase
            .from('quote_items')
            .select('*', { count: 'exact', head: true })
            .eq('quote_id', quote.id);
          
          // Fetch client profile
          let clientData = null;
          if (quote.client_id) {
            const { data: clientProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', quote.client_id)
              .single();
            clientData = clientProfile;
          }

          // Fetch supplier profile
          let supplierData = null;
          if (quote.supplier_id) {
            const { data: supplierProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', quote.supplier_id)
              .single();
            supplierData = supplierProfile;
          }
          
          return {
            ...quote,
            client: clientData,
            supplier: supplierData,
            items_count: itemCount || 0
          } as EnhancedQuote;
        })
      );

      return {
        data: quotesWithCounts,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    quotes: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useQuoteMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast({ 
        title: 'הצלחה', 
        description: 'סטטוס ההצעה עודכן בהצלחה' 
      });
    },
    onError: (error) => {
      console.error('Error updating quote status:', error);
      toast({ 
        title: 'שגיאה', 
        description: 'שגיאה בעדכון סטטוס ההצעה', 
        variant: 'destructive' 
      });
    }
  });

  const deleteQuote = useMutation({
    mutationFn: async (id: string) => {
      // First delete related quote_items
      const { error: itemsError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id);
      
      if (itemsError) throw itemsError;

      // Then delete the quote
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast({ 
        title: 'הצלחה', 
        description: 'הצעת המחיר נמחקה בהצלחה' 
      });
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
      toast({ 
        title: 'שגיאה', 
        description: 'שגיאה במחיקת הצעת המחיר', 
        variant: 'destructive' 
      });
    }
  });

  const resendQuote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotes')
        .update({ 
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast({ 
        title: 'הצלחה', 
        description: 'הצעת המחיר נשלחה מחדש ללקוח' 
      });
    },
    onError: (error) => {
      console.error('Error resending quote:', error);
      toast({ 
        title: 'שגיאה', 
        description: 'שגיאה בשליחת הצעת המחיר', 
        variant: 'destructive' 
      });
    }
  });

  return { 
    updateStatus, 
    deleteQuote,
    resendQuote
  };
};

export const useQuoteRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const channel = supabase
      .channel('admin-quotes-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'quotes' 
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

