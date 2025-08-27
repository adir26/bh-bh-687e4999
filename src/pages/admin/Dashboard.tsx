import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const kpiData = [
  { title: "סה״כ משתמשים", value: "12,459", change: "+12%", icon: Users, color: "text-blue-600" },
  { title: "הזמנות פעילות", value: "1,247", change: "+8%", icon: ShoppingCart, color: "text-green-600" },
  { title: "סה״כ הכנסות", value: "₪89,432", change: "+23%", icon: DollarSign, color: "text-purple-600" },
  { title: "דירוג ממוצע", value: "4.8", change: "+0.2", icon: Star, color: "text-yellow-600" },
];

const monthlyData = [
  { name: "ינו׳", users: 400, orders: 240, revenue: 2400 },
  { name: "פבר׳", users: 300, orders: 139, revenue: 1398 },
  { name: "מרץ", users: 200, orders: 980, revenue: 9800 },
  { name: "אפר׳", users: 278, orders: 390, revenue: 3908 },
  { name: "מאי", users: 189, orders: 480, revenue: 4800 },
  { name: "יוני", users: 239, orders: 380, revenue: 3800 },
];

const categoryData = [
  { name: "מטבח", value: 35, color: "#8884d8" },
  { name: "שיפוצים", value: 25, color: "#82ca9d" },
  { name: "ריהוט", value: 20, color: "#ffc658" },
  { name: "אחר", value: 20, color: "#ff7300" },
];

const recentActivity = [
  { type: "רישום משתמש חדש", details: "יוחנן דוד הצטרף", time: "לפני דקותיים", icon: Users },
  { type: "הזמנה חדשה", details: "הזמנה #1234 בוצעה", time: "לפני 5 דקות", icon: ShoppingCart },
  { type: "ביקורת נשלחה", details: "ביקורת 5 כוכבים עבור ספקי ABC", time: "לפני 10 דקות", icon: Star },
  { type: "תלונה הוגשה", details: "דווח על בעיה במשלוח", time: "לפני 15 דקות", icon: MessageSquare },
];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('30d'));
  
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