import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withTimeout } from '@/lib/withTimeout';
import { toast } from '@/hooks/use-toast';
import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { DateRange, KpiData, TopSupplier, TopCategory, KpiSummary, DateRangePreset } from '@/types/kpi';

// Helper to convert preset to date range
export const getDateRangeFromPreset = (preset: DateRangePreset): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case '7d':
      return { from: subDays(today, 7), to: today };
    case '30d':
      return { from: subDays(today, 30), to: today };
    case '90d':
      return { from: subDays(today, 90), to: today };
    case 'mtd':
      return { from: startOfMonth(today), to: today };
    case 'lm':
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    default:
      return { from: subDays(today, 30), to: today };
  }
};

// Hook for daily KPI data with caching
export const useKpiDaily = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['admin-kpi-daily', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async (): Promise<KpiData[]> => {
      const query = supabase
        .from('kpi_daily')
        .select('*')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      const { data, error } = await withTimeout(query, 15000);

      if (error) {
        console.error('Error fetching KPI data:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes in memory
  });
};

// Hook for top suppliers data
export const useTopSuppliers = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['admin-top-suppliers', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async (): Promise<TopSupplier[]> => {
      const query = supabase
        .from('top_suppliers_30d')
        .select('*');

      const { data, error } = await withTimeout(query, 15000);

      if (error) {
        console.error('Error fetching top suppliers:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
  });
};

// Hook for top categories data
export const useTopCategories = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['admin-top-categories', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async (): Promise<TopCategory[]> => {
      const query = supabase
        .from('top_categories_30d')
        .select('*');

      const { data, error } = await withTimeout(query, 15000);

      if (error) {
        console.error('Error fetching top categories:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
  });
};

// Hook for KPI summary with period over period comparison
export const useKpiSummary = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['admin-kpi-summary', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async (): Promise<KpiSummary> => {
      const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const prevFrom = subDays(dateRange.from, days);
      const prevTo = subDays(dateRange.to, days);

      // Get current period data
      const currentQuery = supabase
        .from('kpi_daily')
        .select('*')
        .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.to, 'yyyy-MM-dd'));

      const { data: currentData, error: currentError } = await withTimeout(currentQuery, 15000);

      if (currentError) throw currentError;

      // Get previous period data for comparison
      const prevQuery = supabase
        .from('kpi_daily')
        .select('*')
        .gte('date', format(prevFrom, 'yyyy-MM-dd'))
        .lte('date', format(prevTo, 'yyyy-MM-dd'));

      const { data: prevData, error: prevError } = await withTimeout(prevQuery, 15000);

      if (prevError) throw prevError;

      // Calculate current period totals
      const currentTotals = (currentData || []).reduce((acc, day) => ({
        users: Math.max(acc.users, day.new_users || 0),
        suppliers: Math.max(acc.suppliers, day.new_suppliers || 0),
        orders: acc.orders + (day.orders_count || 0),
        gmv: acc.gmv + (day.gmv_ils || 0),
        revenue: acc.revenue + (day.revenue_ils || 0),
      }), { users: 0, suppliers: 0, orders: 0, gmv: 0, revenue: 0 });

      // Calculate previous period totals
      const prevTotals = (prevData || []).reduce((acc, day) => ({
        users: Math.max(acc.users, day.new_users || 0),
        suppliers: Math.max(acc.suppliers, day.new_suppliers || 0),
        orders: acc.orders + (day.orders_count || 0),
        gmv: acc.gmv + (day.gmv_ils || 0),
        revenue: acc.revenue + (day.revenue_ils || 0),
      }), { users: 0, suppliers: 0, orders: 0, gmv: 0, revenue: 0 });

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return {
        total_users: currentTotals.users,
        total_suppliers: currentTotals.suppliers,
        total_orders: currentTotals.orders,
        total_gmv: currentTotals.gmv,
        total_revenue: currentTotals.revenue,
        avg_rating: 4.8, // Placeholder - would need reviews aggregation
        users_change: calculateChange(currentTotals.users, prevTotals.users),
        suppliers_change: calculateChange(currentTotals.suppliers, prevTotals.suppliers),
        orders_change: calculateChange(currentTotals.orders, prevTotals.orders),
        revenue_change: calculateChange(currentTotals.revenue, prevTotals.revenue),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes in memory
  });
};

// Hook for logging admin audit events
export const useAdminAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ event_type, event_data }: { event_type: string; event_data: Record<string, any> }) => {
      const { error } = await supabase
        .from('admin_audit_events')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          event_type,
          event_data,
        });

      if (error) throw error;
    },
    onError: (error: any) => {
      console.error('Error logging audit event:', error);
      // Don't show toast for audit errors to avoid disrupting UX
    }
  });
};

// Hook for data refresh
export const useRefreshData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all KPI-related queries
      await queryClient.invalidateQueries({ queryKey: ['admin-kpi-daily'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-top-suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-top-categories'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-kpi-summary'] });
      
      // Optional: Call the refresh function if using materialized views in the future
      // await supabase.rpc('refresh_kpi_data');
    },
    onSuccess: () => {
      toast({
        title: "נתונים רוענו בהצלחה",
        description: "כל הנתונים עודכנו לגרסה האחרונה.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "שגיאה ברענון נתונים",
        description: "לא הצלחנו לרענן את הנתונים. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  });
};