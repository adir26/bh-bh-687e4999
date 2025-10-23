import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  Package
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { KpiCards } from '@/components/admin/KpiCards';
import { AdminDashboardCharts } from '@/components/admin/AdminDashboardCharts';
import { useKpiDaily, useTopSuppliers, useTopCategories, useKpiSummary, useAdminAudit, useRefreshData, getDateRangeFromPreset } from '@/hooks/useAdminKpis';
import type { DateRange } from '@/types/kpi';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('30d'));

  // Refresh KPI daily on mount
  useEffect(() => {
    const refreshKPIs = async () => {
      try {
        await supabase.rpc('refresh_kpi_daily', { 
          p_date: new Date().toISOString().split('T')[0] 
        });
      } catch (error) {
        console.error('Failed to refresh KPIs:', error);
      }
    };
    
    refreshKPIs();
  }, []);
  
  // Fetch real KPI data
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiDaily(dateRange);
  const { data: topSuppliers, isLoading: suppliersLoading, error: suppliersError } = useTopSuppliers(dateRange);
  const { data: topCategories, isLoading: categoriesLoading, error: categoriesError } = useTopCategories(dateRange);
  const { data: kpiSummary, isLoading: summaryLoading, error: summaryError } = useKpiSummary(dateRange);
  
  // Mutations
  const auditMutation = useAdminAudit();
  const refreshMutation = useRefreshData();

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    
    // Log audit event for filter change
    auditMutation.mutate({
      event_type: 'dashboard_filter_change',
      event_data: {
        from: newRange.from.toISOString(),
        to: newRange.to.toISOString(),
      }
    });
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
    
    // Log audit event for manual refresh
    auditMutation.mutate({
      event_type: 'dashboard_manual_refresh',
      event_data: {
        timestamp: new Date().toISOString(),
      }
    });
  };

  const isLoading = kpiLoading || suppliersLoading || categoriesLoading || summaryLoading;
  const hasError = kpiError || suppliersError || categoriesError || summaryError;

  if (hasError) {
    return (
      <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">לוח בקרה</h1>
          <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">סקירה כללית של ביצועי הפלטפורמה</p>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-destructive font-semibold">שגיאה בטעינת נתוני Dashboard</p>
            <p className="text-muted-foreground">לא הצלחנו לטעון את הנתונים. אנא נסה שוב.</p>
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              {refreshMutation.isPending ? "מרענן..." : "נסה שוב"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">לוח בקרה</h1>
        <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">סקירה כללית של ביצועי הפלטפורמה</p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={refreshMutation.isPending}
      />

      {/* KPI Cards */}
      <KpiCards
        data={kpiSummary}
        loading={summaryLoading}
        error={summaryError}
      />

      {/* Charts and Analytics */}
      <AdminDashboardCharts
        kpiData={kpiData}
        topSuppliers={topSuppliers}
        topCategories={topCategories}
        loading={isLoading}
        error={hasError as Error}
      />
    </div>
  );
}