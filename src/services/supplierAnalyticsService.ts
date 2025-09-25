import { supabase } from '@/integrations/supabase/client';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsKPIs {
  gmv: number; // Gross Merchandise Value from accepted quotes + paid orders
  winRate: number; // Percentage of quotes that got accepted
  avgResponseTime: number; // Hours from lead creation to first activity
  leadsCount: number;
  ordersCount: number;
  quotesCount: number;
  previousPeriodGmv: number; // For comparison
  previousPeriodLeads: number;
}

export interface LeadsBySource {
  source: string;
  count: number;
  percentage: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GmvByPeriod {
  date: string;
  gmv: number;
  ordersValue: number;
  quotesValue: number;
}

export interface TopProduct {
  name: string;
  views: number;
  orders: number;
  conversion: number;
}

export class SupplierAnalyticsService {
  private async getCurrentSupplierId(): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) throw new Error('Not authenticated');
    return userData.user.id;
  }

  private getDateRangeFilter(dateRange: AnalyticsDateRange) {
    return {
      from: startOfDay(dateRange.from).toISOString(),
      to: endOfDay(dateRange.to).toISOString(),
    };
  }

  private getPreviousPeriodRange(dateRange: AnalyticsDateRange): AnalyticsDateRange {
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    return {
      from: new Date(dateRange.from.getTime() - diff),
      to: new Date(dateRange.from.getTime() - 1),
    };
  }

  async getKPIs(dateRange: AnalyticsDateRange): Promise<AnalyticsKPIs> {
    const supplierId = await this.getCurrentSupplierId();
    const { from, to } = this.getDateRangeFilter(dateRange);
    const previousRange = this.getPreviousPeriodRange(dateRange);
    const { from: prevFrom, to: prevTo } = this.getDateRangeFilter(previousRange);

    // Current period queries
    const [ordersResult, quotesResult, leadsResult, responseTimeResult] = await Promise.all([
      // Orders GMV (completed and in_progress orders)
      supabase
        .from('orders')
        .select('amount')
        .eq('supplier_id', supplierId)
        .in('status', ['completed', 'in_progress', 'confirmed'])
        .gte('created_at', from)
        .lte('created_at', to),

      // Quotes GMV (accepted quotes)
      supabase
        .from('quotes')
        .select('total_amount')
        .eq('supplier_id', supplierId)
        .eq('status', 'accepted')
        .gte('created_at', from)
        .lte('created_at', to),

      // Leads count
      supabase
        .from('leads')
        .select('id')
        .eq('supplier_id', supplierId)
        .gte('created_at', from)
        .lte('created_at', to),

      // Average response time calculation
      supabase
        .from('leads')
        .select('created_at, first_response_at')
        .eq('supplier_id', supplierId)
        .not('first_response_at', 'is', null)
        .gte('created_at', from)
        .lte('created_at', to),
    ]);

    // Previous period comparison
    const [prevOrdersResult, prevLeadsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('amount')
        .eq('supplier_id', supplierId)
        .in('status', ['completed', 'in_progress', 'confirmed'])
        .gte('created_at', prevFrom)
        .lte('created_at', prevTo),

      supabase
        .from('leads')
        .select('id')
        .eq('supplier_id', supplierId)
        .gte('created_at', prevFrom)
        .lte('created_at', prevTo),
    ]);

    // Calculate win rate (quotes accepted vs total quotes)
    const { data: totalQuotes } = await supabase
      .from('quotes')
      .select('id')
      .eq('supplier_id', supplierId)
      .in('status', ['sent', 'accepted', 'rejected'])
      .gte('created_at', from)
      .lte('created_at', to);

    const ordersGmv = ordersResult.data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
    const quotesGmv = quotesResult.data?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;
    const totalGmv = ordersGmv + quotesGmv;

    const acceptedQuotes = quotesResult.data?.length || 0;
    const totalQuotesCount = totalQuotes?.length || 0;
    const winRate = totalQuotesCount > 0 ? (acceptedQuotes / totalQuotesCount) * 100 : 0;

    // Calculate average response time in hours
    const responseTimes = responseTimeResult.data?.map(lead => {
      const created = new Date(lead.created_at);
      const responded = new Date(lead.first_response_at!);
      return (responded.getTime() - created.getTime()) / (1000 * 60 * 60); // Convert to hours
    }) || [];
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const previousPeriodGmv = prevOrdersResult.data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
    const previousPeriodLeads = prevLeadsResult.data?.length || 0;

    return {
      gmv: totalGmv,
      winRate: Math.round(winRate * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      leadsCount: leadsResult.data?.length || 0,
      ordersCount: ordersResult.data?.length || 0,
      quotesCount: acceptedQuotes,
      previousPeriodGmv,
      previousPeriodLeads,
    };
  }

  async getLeadsBySource(dateRange: AnalyticsDateRange): Promise<LeadsBySource[]> {
    const supplierId = await this.getCurrentSupplierId();
    const { from, to } = this.getDateRangeFilter(dateRange);

    const { data, error } = await supabase
      .from('leads')
      .select('source')
      .eq('supplier_id', supplierId)
      .gte('created_at', from)
      .lte('created_at', to);

    if (error) throw error;

    const sourceCounts = (data || []).reduce((acc, lead) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source: source === 'website' ? 'אתר' : source === 'referral' ? 'הפניה' : source === 'social' ? 'רשתות חברתיות' : source,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getOrdersByStatus(dateRange: AnalyticsDateRange): Promise<OrdersByStatus[]> {
    const supplierId = await this.getCurrentSupplierId();
    const { from, to } = this.getDateRangeFilter(dateRange);

    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('supplier_id', supplierId)
      .gte('created_at', from)
      .lte('created_at', to);

    if (error) throw error;

    const statusCounts = (data || []).reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    const statusColors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };

    const statusLabels: Record<string, string> = {
      pending: 'ממתין',
      confirmed: 'אושר',
      in_progress: 'בתהליך',
      completed: 'הושלם',
      cancelled: 'בוטל',
    };

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status: statusLabels[status] || status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: statusColors[status] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getGmvByWeek(dateRange: AnalyticsDateRange): Promise<GmvByPeriod[]> {
    const supplierId = await this.getCurrentSupplierId();
    const { from, to } = this.getDateRangeFilter(dateRange);

    // Get orders and quotes data
    const [ordersResult, quotesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('amount, created_at')
        .eq('supplier_id', supplierId)
        .in('status', ['completed', 'in_progress', 'confirmed'])
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at'),

      supabase
        .from('quotes')
        .select('total_amount, created_at')
        .eq('supplier_id', supplierId)
        .eq('status', 'accepted')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at'),
    ]);

    // Generate date buckets (weekly)
    const buckets: Record<string, { ordersValue: number; quotesValue: number }> = {};
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    
    for (let date = new Date(startDate); date <= endDate; date = addDays(date, 7)) {
      const weekKey = format(date, 'yyyy-MM-dd');
      buckets[weekKey] = { ordersValue: 0, quotesValue: 0 };
    }

    // Aggregate orders by week
    ordersResult.data?.forEach(order => {
      const orderDate = new Date(order.created_at);
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Start of week
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (buckets[weekKey]) {
        buckets[weekKey].ordersValue += order.amount || 0;
      }
    });

    // Aggregate quotes by week
    quotesResult.data?.forEach(quote => {
      const quoteDate = new Date(quote.created_at);
      const weekStart = new Date(quoteDate);
      weekStart.setDate(quoteDate.getDate() - quoteDate.getDay()); // Start of week
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (buckets[weekKey]) {
        buckets[weekKey].quotesValue += quote.total_amount || 0;
      }
    });

    return Object.entries(buckets)
      .map(([date, values]) => ({
        date: format(new Date(date), 'dd/MM'),
        gmv: values.ordersValue + values.quotesValue,
        ordersValue: values.ordersValue,
        quotesValue: values.quotesValue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProducts(dateRange: AnalyticsDateRange): Promise<TopProduct[]> {
    const supplierId = await this.getCurrentSupplierId();
    const { from, to } = this.getDateRangeFilter(dateRange);

    // Get company analytics for views and orders by product
    const { data: analytics, error } = await supabase
      .from('company_analytics')
      .select('metric_name, metric_value, metadata')
      .eq('company_id', supplierId)
      .in('metric_name', ['product_view', 'product_order'])
      .gte('created_at', from)
      .lte('created_at', to);

    if (error) throw error;

    // Aggregate by product
    const productStats: Record<string, { views: number; orders: number }> = {};
    
    (analytics || []).forEach(record => {
      const metadata = record.metadata as { product_name?: string } | null;
      const productName = metadata?.product_name || 'שירות כללי';
      
      if (!productStats[productName]) {
        productStats[productName] = { views: 0, orders: 0 };
      }

      if (record.metric_name === 'product_view') {
        productStats[productName].views += record.metric_value || 0;
      } else if (record.metric_name === 'product_order') {
        productStats[productName].orders += record.metric_value || 0;
      }
    });

    return Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        views: stats.views,
        orders: stats.orders,
        conversion: stats.views > 0 ? Math.round((stats.orders / stats.views) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5); // Top 5 products
  }

  // Utility method to get preset date ranges
  static getDatePreset(preset: '7d' | '30d' | '90d'): AnalyticsDateRange {
    const to = new Date();
    const from = new Date();

    switch (preset) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from.setDate(from.getDate() - 90);
        break;
    }

    return { from, to };
  }
}

export const supplierAnalyticsService = new SupplierAnalyticsService();