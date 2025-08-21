
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardFilters } from '@/components/supplier/DashboardFilters';
import { DashboardKPIs } from '@/components/supplier/DashboardKPIs';
import { DashboardCharts } from '@/components/supplier/DashboardCharts';
import { DashboardTables } from '@/components/supplier/DashboardTables';
import { 
  useDashboardMetrics,
  useTimeSeriesData,
  useRecentLeads,
  useRecentOrders,
  useRecentReviews,
  useSupplierRealtime,
  DateRange,
  Granularity
} from '@/hooks/useSupplierDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for filters
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();

  // Get supplier ID (for now, use user ID - adjust based on your schema)
  const supplierId = user?.id || '';

  // Data hooks
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics(supplierId, dateRange, customFrom, customTo);

  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useTimeSeriesData(supplierId, dateRange, granularity, customFrom, customTo);

  const {
    data: recentLeads,
    isLoading: leadsLoading,
    error: leadsError,
  } = useRecentLeads(supplierId);

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useRecentOrders(supplierId);

  const {
    data: recentReviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useRecentReviews(supplierId);

  // Real-time subscription
  const handleMetricsUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['supplier-dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-timeseries'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-recent-leads'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-recent-orders'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-recent-reviews'] });
  };

  useSupplierRealtime(supplierId, handleMetricsUpdate);

  // Authorization check
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_metadata?.role !== 'supplier') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleRefresh = () => {
    handleMetricsUpdate();
  };

  // Show loading state if no user yet
  if (!user) {
    return <div className="min-h-screen bg-background" />;
  }

  // Get alerts/tasks that need attention
  const alerts = [];
  if (recentLeads) {
    const slaViolations = recentLeads.filter(lead => lead.sla_risk);
    if (slaViolations.length > 0) {
      alerts.push({
        type: 'warning' as const,
        title: `${slaViolations.length} לידים דורשים תגובה דחופה`,
        description: 'לידים שלא נענו תוך 24 שעות',
        action: () => navigate('/supplier/lead-management?sla_risk=true')
      });
    }
  }

  if (recentOrders) {
    const unreadMessages = recentOrders.reduce((sum, order) => sum + order.unread_messages, 0);
    if (unreadMessages > 0) {
      alerts.push({
        type: 'info' as const,
        title: `${unreadMessages} הודעות חדשות`,
        description: 'הודעות שלא נקראו מלקוחות',
        action: () => navigate('/supplier/order-management?unread=true')
      });
    }
  }

  return (
    <div className="min-h-screen bg-background pb-safe" dir="rtl">
      {/* Header */}
      <div className="mobile-padding border-b border-border pt-safe">
        <div className="mobile-container flex justify-between items-center">
          <h1 className="text-lg xs:text-xl font-bold">לוח בקרה - ספק</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${metricsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="mobile-padding space-y-6">
        <div className="mobile-container max-w-none space-y-6">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert 
                  key={index} 
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    alert.type === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'
                  }`}
                  onClick={alert.action}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      צפה
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Filters */}
          <DashboardFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            granularity={granularity}
            onGranularityChange={setGranularity}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
          />

          {/* KPIs */}
          <DashboardKPIs
            metrics={metrics}
            loading={metricsLoading}
            error={metricsError}
          />

          {/* Charts */}
          <DashboardCharts
            timeSeriesData={timeSeriesData}
            loading={timeSeriesLoading}
            error={timeSeriesError}
            granularity={granularity}
          />

          {/* Tables */}
          <DashboardTables
            leads={recentLeads}
            orders={recentOrders}
            reviews={recentReviews}
            leadsLoading={leadsLoading}
            ordersLoading={ordersLoading}
            reviewsLoading={reviewsLoading}
            leadsError={leadsError}
            ordersError={ordersError}
            reviewsError={reviewsError}
          />
        </div>
      </div>
    </div>
  );
}
