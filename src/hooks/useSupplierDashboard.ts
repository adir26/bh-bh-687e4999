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
  source_key: string;
  status: string;
  priority_key: string;
  created_at: string;
  last_contact_date: string | null;
  sla_risk: boolean;
  // Legacy fields for backward compatibility
  source?: string;
  priority?: string;
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

// Unified dashboard data interface
export interface UnifiedDashboardData {
  metrics: DashboardMetrics;
  recent_leads: RecentLead[];
  recent_orders: RecentOrder[];
  recent_reviews: RecentReview[];
}

// OPTIMIZED: Single unified dashboard hook - eliminates N+1 queries
export const useUnifiedDashboardData = (
  supplierId: string,
  dateRange: DateRange,
  customFrom?: Date,
  customTo?: Date
) => {
  const { from, to } = getDateRange(dateRange, customFrom, customTo);
  
  return useQuery({
    queryKey: ['supplier-unified-dashboard', supplierId, from.toISOString(), to.toISOString()],
    queryFn: async (): Promise<UnifiedDashboardData> => {
      const { data, error } = await supabase.rpc('get_supplier_dashboard_data', {
        _supplier_id: supplierId,
        _from: from.toISOString(),
        _to: to.toISOString(),
        _recent_limit: 10
      });
      
      if (error) throw error;
      
      // Parse the JSONB response
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed as UnifiedDashboardData;
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
  });
};

// Legacy hook for backwards compatibility - now uses unified data
export const useDashboardMetrics = (
  supplierId: string,
  dateRange: DateRange,
  customFrom?: Date,
  customTo?: Date
) => {
  const unifiedQuery = useUnifiedDashboardData(supplierId, dateRange, customFrom, customTo);
  
  return {
    ...unifiedQuery,
    data: unifiedQuery.data?.metrics,
  };
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

// OPTIMIZED: Recent leads hook - now uses unified data
export const useRecentLeads = (supplierId: string) => {
  const { from, to } = getDateRange('30d');
  const unifiedQuery = useUnifiedDashboardData(supplierId, '30d');
  
  return {
    ...unifiedQuery,
    data: unifiedQuery.data?.recent_leads || [],
  };
};

// OPTIMIZED: Recent orders hook - now uses unified data
export const useRecentOrders = (supplierId: string) => {
  const unifiedQuery = useUnifiedDashboardData(supplierId, '30d');
  
  return {
    ...unifiedQuery,
    data: unifiedQuery.data?.recent_orders || [],
  };
};

// OPTIMIZED: Recent reviews hook - now uses unified data
export const useRecentReviews = (supplierId: string) => {
  const unifiedQuery = useUnifiedDashboardData(supplierId, '30d');
  
  return {
    ...unifiedQuery,
    data: unifiedQuery.data?.recent_reviews || [],
  };
};

// OPTIMIZED: Real-time subscription hook with debouncing and consolidated channel
export const useSupplierRealtime = (
  supplierId: string,
  onMetricsUpdate: () => void
) => {
  const subscribeToRealtime = useCallback(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    // Debounced update function to prevent "thundering herd"
    const debouncedUpdate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        console.log('Debounced update triggered, refreshing dashboard data');
        onMetricsUpdate();
      }, 1000); // 1 second debounce
    };

    // OPTIMIZED: Single consolidated channel for all supplier data changes
    const channel = supabase
      .channel(`supplier-dashboard-${supplierId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `supplier_id=eq.${supplierId}`
        },
        debouncedUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `supplier_id=eq.${supplierId}`
        },
        debouncedUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes',
          filter: `supplier_id=eq.${supplierId}`
        },
        debouncedUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `reviewed_id=eq.${supplierId}`
        },
        debouncedUpdate
      )
      .subscribe();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      supabase.removeChannel(channel);
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