import { useQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for dashboard data
export interface DashboardMetrics {
  leads_new: number;
  leads_in_progress: number;
  lead_conversion_rate: number;
  quotes_sent: number;
  quotes_accepted: number;
  orders_active: number;
  orders_completed: number;
  revenue: number;
  aov: number;
  rating_avg: number;
  reviews_count: number;
  avg_response_time_hours: number;
  prev_revenue: number;
  prev_orders_completed: number;
}

export interface TimeSeriesData {
  bucket: string;
  revenue: number;
  leads_count: number;
  orders_count: number;
  reviews_count: number;
  profile_views: number;
}

export interface RecentLead {
  id: string;
  name: string;
  contact_email: string;
  source: string;
  status: string;
  priority: string;
  created_at: string;
  last_contact_date: string | null;
  sla_risk: boolean;
}

export interface RecentOrder {
  id: string;
  title: string;
  status: string;
  amount: number;
  due_date: string | null;
  created_at: string;
  client_name: string;
  unread_messages: number;
}

export interface RecentReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  reviewer_name: string;
}

export type DateRange = 'today' | '7d' | '30d' | 'mtd' | 'qtd' | 'ytd' | 'custom';
export type Granularity = 'day' | 'week' | 'month';

interface DateRangeValue {
  from: Date;
  to: Date;
}

// Date range calculations
export const getDateRange = (range: DateRange, customFrom?: Date, customTo?: Date): DateRangeValue => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case '7d':
      return {
        from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case '30d':
      return {
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'mtd':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'qtd':
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        from: new Date(now.getFullYear(), quarter * 3, 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'ytd':
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'custom':
      return {
        from: customFrom || new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: customTo || new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    default:
      return {
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};

// Dashboard metrics hook
export const useDashboardMetrics = (
  supplierId: string,
  dateRange: DateRange,
  customFrom?: Date,
  customTo?: Date
) => {
  const { from, to } = getDateRange(dateRange, customFrom, customTo);
  
  return useQuery({
    queryKey: ['supplier-dashboard-metrics', supplierId, from.toISOString(), to.toISOString()],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data, error } = await supabase.rpc('supplier_dashboard_metrics', {
        _supplier_id: supplierId,
        _from: from.toISOString(),
        _to: to.toISOString()
      });
      
      if (error) throw error;
      return data as unknown as DashboardMetrics;
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Time series data hook
export const useTimeSeriesData = (
  supplierId: string,
  dateRange: DateRange,
  granularity: Granularity,
  customFrom?: Date,
  customTo?: Date
) => {
  const { from, to } = getDateRange(dateRange, customFrom, customTo);
  
  return useQuery({
    queryKey: ['supplier-timeseries', supplierId, from.toISOString(), to.toISOString(), granularity],
    queryFn: async (): Promise<TimeSeriesData[]> => {
      const { data, error } = await supabase.rpc('supplier_timeseries', {
        _supplier_id: supplierId,
        _from: from.toISOString(),
        _to: to.toISOString(),
        _grain: granularity
      });
      
      if (error) throw error;
      return data as TimeSeriesData[];
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
};

// Recent leads hook
export const useRecentLeads = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-recent-leads', supplierId],
    queryFn: async (): Promise<RecentLead[]> => {
      const { data, error } = await supabase.rpc('supplier_recent_leads', {
        _supplier_id: supplierId,
        _limit: 10
      });
      
      if (error) throw error;
      return data as RecentLead[];
    },
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });
};

// Recent orders hook
export const useRecentOrders = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-recent-orders', supplierId],
    queryFn: async (): Promise<RecentOrder[]> => {
      const { data, error } = await supabase.rpc('supplier_recent_orders', {
        _supplier_id: supplierId,
        _limit: 10
      });
      
      if (error) throw error;
      return data as RecentOrder[];
    },
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });
};

// Recent reviews hook
export const useRecentReviews = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-recent-reviews', supplierId],
    queryFn: async (): Promise<RecentReview[]> => {
      const { data, error } = await supabase.rpc('supplier_recent_reviews', {
        _supplier_id: supplierId,
        _limit: 10
      });
      
      if (error) throw error;
      return data as RecentReview[];
    },
    enabled: !!supplierId,
    staleTime: 10 * 60 * 1000, // Reviews change less frequently
  });
};

// Real-time subscription hook
export const useSupplierRealtime = (
  supplierId: string,
  onMetricsUpdate: () => void
) => {
  const subscribeToRealtime = useCallback(() => {
    const channels = [
      // Subscribe to leads changes
      supabase
        .channel('leads-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads',
            filter: `supplier_id=eq.${supplierId}`
          },
          () => {
            console.log('Leads updated, refreshing metrics');
            onMetricsUpdate();
          }
        )
        .subscribe(),

      // Subscribe to orders changes
      supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `supplier_id=eq.${supplierId}`
          },
          () => {
            console.log('Orders updated, refreshing metrics');
            onMetricsUpdate();
          }
        )
        .subscribe(),

      // Subscribe to quotes changes
      supabase
        .channel('quotes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quotes',
            filter: `supplier_id=eq.${supplierId}`
          },
          () => {
            console.log('Quotes updated, refreshing metrics');
            onMetricsUpdate();
          }
        )
        .subscribe(),

      // Subscribe to reviews changes
      supabase
        .channel('reviews-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reviews',
            filter: `reviewed_id=eq.${supplierId}`
          },
          () => {
            console.log('Reviews updated, refreshing metrics');
            onMetricsUpdate();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [supplierId, onMetricsUpdate]);

  useEffect(() => {
    if (!supplierId) return;
    
    const cleanup = subscribeToRealtime();
    return cleanup;
  }, [subscribeToRealtime, supplierId]);
};

// Format currency with Hebrew locale
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};