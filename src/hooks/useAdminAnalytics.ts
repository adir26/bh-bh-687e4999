import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  revenue: { month: string; revenue: number; orders: number; users: number }[];
  categories: { name: string; value: number; color: string }[];
  userActivity: { time: string; active: number }[];
  metrics: {
    totalRevenue: number;
    revenueChange: string;
    activeUsers: number;
    usersChange: string;
    orderVolume: number;
    ordersChange: string;
    avgRating: number;
    ratingChange: string;
  };
  performance: {
    conversionRate: number;
    conversionChange: string;
    avgOrderValue: number;
    avgOrderChange: string;
    customerSatisfaction: number;
    satisfactionChange: string;
  };
}

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Fetch orders with created_at dates
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, amount, created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, role')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (profilesError) throw profilesError;

      // Fetch categories with lead counts
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          leads:leads(count)
        `)
        .eq('parent_id', null) // Only top-level categories
        .limit(5);

      if (categoriesError) throw categoriesError;

      // Process revenue data by month
      const monthlyData = new Map<string, { revenue: number; orders: number; users: number }>();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${monthNames[date.getMonth()]}`;
        monthlyData.set(key, { revenue: 0, orders: 0, users: 0 });
      }

      // Process orders
      orders?.forEach(order => {
        const date = new Date(order.created_at);
        const key = monthNames[date.getMonth()];
        if (monthlyData.has(key)) {
          const current = monthlyData.get(key)!;
          current.revenue += Number(order.amount || 0);
          current.orders += 1;
        }
      });

      // Process users
      profiles?.forEach(profile => {
        const date = new Date(profile.created_at);
        const key = monthNames[date.getMonth()];
        if (monthlyData.has(key)) {
          const current = monthlyData.get(key)!;
          current.users += 1;
        }
      });

      const revenueData = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data
      }));

      // Process category data
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
      const totalLeads = categories?.reduce((sum, cat: any) => sum + (cat.leads?.[0]?.count || 0), 0) || 1;
      
      const categoryData = categories?.map((cat: any, idx: number) => ({
        name: cat.name,
        value: Math.round(((cat.leads?.[0]?.count || 0) / totalLeads) * 100),
        color: colors[idx % colors.length]
      })) || [];

      // Calculate user activity from real profile creation times
      const hourBuckets = [0, 4, 8, 12, 16, 20];
      const userActivity = hourBuckets.map(hour => {
        const count = profiles?.filter(p => {
          const h = new Date(p.created_at).getHours();
          return h >= hour && h < hour + 4;
        }).length || 0;
        return { time: `${String(hour).padStart(2, '0')}:00`, active: count };
      });

      // Calculate metrics with real previous period comparison
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const activeUsers = profiles?.length || 0;
      const orderVolume = orders?.length || 0;

      // Real previous period: compare first 3 months vs last 3 months
      const midpoint = new Date();
      midpoint.setMonth(midpoint.getMonth() - 3);
      const midpointStr = midpoint.toISOString();

      const prevOrders = orders?.filter(o => o.created_at < midpointStr) || [];
      const currOrders = orders?.filter(o => o.created_at >= midpointStr) || [];
      const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
      const currRevenue = currOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

      const prevUsers = profiles?.filter(p => p.created_at < midpointStr).length || 0;
      const currUsers = profiles?.filter(p => p.created_at >= midpointStr).length || 0;

      const calcChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? '+100%' : '0%';
        const pct = ((curr - prev) / prev * 100).toFixed(1);
        return `${Number(pct) >= 0 ? '+' : ''}${pct}%`;
      };

      // Calculate real avg rating from reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('rating')
        .gte('created_at', sixMonthsAgo.toISOString());

      const avgRating = reviewData && reviewData.length > 0
        ? Number((reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewData.length).toFixed(1))
        : 0;

      const metrics = {
        totalRevenue,
        revenueChange: calcChange(currRevenue, prevRevenue),
        activeUsers,
        usersChange: calcChange(currUsers, prevUsers),
        orderVolume,
        ordersChange: calcChange(currOrders.length, prevOrders.length),
        avgRating,
        ratingChange: '0',
      };

      const performance = {
        conversionRate: orderVolume > 0 ? (completedOrders / orderVolume * 100) : 0,
        conversionChange: calcChange(
          currOrders.filter(o => o.status === 'completed').length,
          prevOrders.filter(o => o.status === 'completed').length
        ),
        avgOrderValue: orderVolume > 0 ? totalRevenue / orderVolume : 0,
        avgOrderChange: calcChange(
          currOrders.length > 0 ? currRevenue / currOrders.length : 0,
          prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0
        ),
        customerSatisfaction: avgRating > 0 ? Math.round(avgRating / 5 * 100) : 0,
        satisfactionChange: '0%'
      };

      return {
        revenue: revenueData,
        categories: categoryData,
        userActivity,
        metrics,
        performance
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
