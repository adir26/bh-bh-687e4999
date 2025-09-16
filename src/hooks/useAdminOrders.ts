import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedOrder,
  OrderFilters,
  PaginationParams,
  OrdersResponse,
  Refund
} from '@/types/admin';
import { FEATURES } from '@/config/featureFlags';

export const useAdminOrders = (
  filters: OrderFilters,
  pagination: PaginationParams
) => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders', filters, pagination],
    queryFn: async (): Promise<OrdersResponse> => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          client_profile:profiles!orders_client_id_fkey(id, full_name, email),
          supplier_profile:profiles!orders_supplier_id_fkey(id, full_name, email),
          refunds(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }
      
      if (FEATURES.PAYMENTS_ENABLED && filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      
      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      
      if (filters.search) {
        query = query.or(`
          order_number.ilike.%${filters.search}%,
          title.ilike.%${filters.search}%,
          client_profile.full_name.ilike.%${filters.search}%,
          client_profile.email.ilike.%${filters.search}%
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

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      const enhancedOrders: EnhancedOrder[] = orders?.map(order => ({
        ...order,
        refunded_amount: order.refunds?.reduce((sum: number, refund: any) => sum + Number(refund.amount), 0) || 0
      })) || [];

      return {
        data: enhancedOrders,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    orders: data?.data || [],
    totalCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  };
};

export const useOrderMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: any; note?: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', id);
      
      if (error) throw error;

      // Add note to order status history if provided
      if (note) {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('order_status_history').insert({
          order_id: id,
          status,
          changed_by: userData.user?.id!,
          notes: note
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס ההזמנה עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון הסטטוס',
        variant: 'destructive',
      });
    }
  });

  // Update payment status
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: string }) => {
      if (!FEATURES.PAYMENTS_ENABLED) {
        throw new Error('Payments are disabled at the moment');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'הצלחה',
        description: 'סטטוס התשלום עודכן בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error updating payment status:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בעדכון סטטוס התשלום',
        variant: 'destructive',
      });
    }
  });

  // Process refund
  const processRefund = useMutation({
    mutationFn: async ({ 
      orderId, 
      amount, 
      reason 
    }: { 
      orderId: string; 
      amount: number; 
      reason: string; 
    }) => {
      const { data, error } = await supabase.rpc('admin_refund_order', {
        _order_id: orderId,
        _amount: amount,
        _reason: reason
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-refunds'] });
      toast({
        title: 'הצלחה',
        description: 'ההחזר עובד בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error processing refund:', error);
      toast({
        title: 'שגיאה',
        description: error.message.includes('exceeds') ? 'סכום ההחזר עולה על סכום ההזמנה' : 'אירעה שגיאה בעיבוד ההחזר',
        variant: 'destructive',
      });
    }
  });

  return {
    updateOrderStatus,
    updatePaymentStatus,
    processRefund
  };
};

export const useOrderRefunds = (orderId?: string) => {
  return useQuery({
    queryKey: ['order-refunds', orderId],
    queryFn: async (): Promise<Refund[]> => {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          processed_by_profile:profiles!refunds_processed_by_fkey(full_name)
        `)
        .eq('order_id', orderId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId
  });
};

export const useOrderStatusHistory = (orderId?: string) => {
  return useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          *,
          changed_by_profile:profiles!order_status_history_changed_by_fkey(full_name)
        `)
        .eq('order_id', orderId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId
  });
};

// Real-time subscriptions for order updates
export const useOrderRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'refunds'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['order-refunds'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_status_history'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['order-status-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};