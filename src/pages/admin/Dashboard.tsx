import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
  Mail
} from "lucide-react";
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { KpiCards } from '@/components/admin/KpiCards';
import { useKpiDaily, useTopSuppliers, useTopCategories, useKpiSummary, useAdminAudit, useRefreshData, getDateRangeFromPreset } from '@/hooks/useAdminKpis';
import type { DateRange } from '@/types/kpi';
import { Skeleton } from '@/components/ui/skeleton';

// Component for recent signups
function RecentSignupsTable() {
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setRecentUsers(data || []);
      } catch (error) {
        console.error('Error fetching recent users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (recentUsers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">אין משתמשים חדשים</div>;
  }

  const getRoleBadge = (role: string) => {
    if (role === 'supplier') {
      return <Badge className="bg-blue-100 text-blue-800">ספק</Badge>;
    }
    if (role === 'client') {
      return <Badge variant="outline">לקוח</Badge>;
    }
    return <Badge variant="secondary">{role}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">שם</TableHead>
            <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">אימייל</TableHead>
            <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">תפקיד</TableHead>
            <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">תאריך</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-right font-medium text-xs sm:text-sm p-2 sm:p-4">
                <div className="max-w-[120px] sm:max-w-none truncate">{user.full_name || 'משתמש'}</div>
              </TableCell>
              <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                <div className="max-w-[180px] truncate">{user.email}</div>
              </TableCell>
              <TableCell className="text-right p-2 sm:p-4">{getRoleBadge(user.role)}</TableCell>
              <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4 whitespace-nowrap">{formatDate(user.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Top Suppliers */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-right font-hebrew text-base sm:text-lg">ספקים מובילים</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-4 md:p-6 pt-0">
            {isLoading ? (
              <div className="space-y-2 p-3 sm:p-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topSuppliers && topSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[300px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">ספק</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">הזמנות</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">דירוג</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSuppliers.slice(0, 5).map((supplier, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-right font-medium text-xs sm:text-sm p-2 sm:p-4">
                          <div className="max-w-[100px] sm:max-w-none truncate">{supplier.name || 'ללא שם'}</div>
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4">{supplier.orders || 0}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">N/A</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">אין נתונים</div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-right font-hebrew text-base sm:text-lg">קטגוריות פופולריות</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-4 md:p-6 pt-0">
            {isLoading ? (
              <div className="space-y-2 p-3 sm:p-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topCategories && topCategories.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[300px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">קטגוריה</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">ספקים</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm p-2 sm:p-4">לידים</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCategories.slice(0, 5).map((category, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-right font-medium text-xs sm:text-sm p-2 sm:p-4">
                          <div className="max-w-[100px] sm:max-w-none truncate">{category.category_name || 'ללא שם'}</div>
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">-</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm p-2 sm:p-4">{category.orders || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">אין נתונים</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups Table */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-right font-hebrew text-base sm:text-lg">משתמשים חדשים (10 אחרונים)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6 pt-0">
          {isLoading ? (
            <div className="space-y-2 p-3 sm:p-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <RecentSignupsTable />
          )}
        </CardContent>
      </Card>
    </div>
  );
}