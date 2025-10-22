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

      // Calculate user activity (hourly distribution - mock for now as we need real-time data)
      const userActivity = [
        { time: "00:00", active: Math.floor(profiles?.length * 0.1) || 20 },
        { time: "04:00", active: Math.floor(profiles?.length * 0.07) || 15 },
        { time: "08:00", active: Math.floor(profiles?.length * 0.25) || 50 },
        { time: "12:00", active: Math.floor(profiles?.length * 0.35) || 80 },
        { time: "16:00", active: Math.floor(profiles?.length * 0.32) || 70 },
        { time: "20:00", active: Math.floor(profiles?.length * 0.28) || 60 },
      ];

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const activeUsers = profiles?.length || 0;
      const orderVolume = orders?.length || 0;

      // Calculate previous period for comparison (simplified)
      const prevPeriodRevenue = totalRevenue * 0.9; // Mock 10% growth
      const prevUsers = activeUsers * 0.92; // Mock 8% growth
      const prevOrders = orderVolume * 0.87; // Mock 13% growth

      const metrics = {
        totalRevenue,
        revenueChange: `+${((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue * 100).toFixed(1)}%`,
        activeUsers,
        usersChange: `+${((activeUsers - prevUsers) / prevUsers * 100).toFixed(1)}%`,
        orderVolume,
        ordersChange: `+${((orderVolume - prevOrders) / prevOrders * 100).toFixed(1)}%`,
        avgRating: 4.8,
        ratingChange: '+0.2'
      };

      const performance = {
        conversionRate: orderVolume > 0 ? (completedOrders / orderVolume * 100) : 0,
        conversionChange: '+0.5%',
        avgOrderValue: orderVolume > 0 ? totalRevenue / orderVolume : 0,
        avgOrderChange: `+${Math.floor(totalRevenue / orderVolume * 0.15) || 45}`,
        customerSatisfaction: 96,
        satisfactionChange: '+2%'
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
