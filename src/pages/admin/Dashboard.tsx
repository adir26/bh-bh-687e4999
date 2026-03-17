import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, ShoppingCart, TrendingUp, TrendingDown, DollarSign, 
  Activity, AlertCircle, RefreshCw, ArrowUpRight
} from "lucide-react";
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { KpiCards } from '@/components/admin/KpiCards';
import { useKpiDaily, useTopSuppliers, useTopCategories, useKpiSummary, useAdminAudit, useRefreshData, getDateRangeFromPreset } from '@/hooks/useAdminKpis';
import type { DateRange } from '@/types/kpi';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function SignupsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  const chartData = data.map(d => ({
    date: format(new Date(d.d), 'dd/MM'),
    suppliers: d.signups_suppliers,
    customers: d.signups_customers,
    total: d.signups_total,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }} 
        />
        <Area type="monotone" dataKey="suppliers" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.4} name="ספקים" />
        <Area type="monotone" dataKey="customers" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} name="לקוחות" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActiveUsersChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  const chartData = data.map(d => ({
    date: format(new Date(d.d), 'dd/MM'),
    dau: d.dau,
    wau: d.wau,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }} 
        />
        <Bar dataKey="dau" fill="hsl(var(--chart-3))" name="DAU" radius={[4, 4, 0, 0]} />
        <Bar dataKey="wau" fill="hsl(var(--chart-4))" name="WAU" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

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
          .limit(8);
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
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary">
                {(user.full_name || 'מ')[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name || 'משתמש'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={user.role === 'supplier' ? 'default' : 'outline'} className="text-xs">
              {user.role === 'supplier' ? 'ספק' : 'לקוח'}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(user.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemHealthCard() {
  const [health, setHealth] = React.useState({ pendingSuppliers: 0, openComplaints: 0, pendingOrders: 0 });

  useEffect(() => {
    const fetchHealth = async () => {
      const [suppRes, orderRes] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      setHealth({
        pendingSuppliers: suppRes.count || 0,
        openComplaints: 0,
        pendingOrders: orderRes.count || 0,
      });
    };
    fetchHealth();
  }, []);

  const items = [
    { label: 'ספקים ממתינים לאישור', value: health.pendingSuppliers, urgent: health.pendingSuppliers > 0 },
    { label: 'הזמנות ממתינות', value: health.pendingOrders, urgent: health.pendingOrders > 5 },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          item.urgent ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"
        )}>
          <div className="flex items-center gap-2">
            {item.urgent && <AlertCircle className="h-4 w-4 text-destructive" />}
            <span className="text-sm">{item.label}</span>
          </div>
          <Badge variant={item.urgent ? "destructive" : "secondary"}>{item.value}</Badge>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('30d'));

  useEffect(() => {
    const refreshKPIs = async () => {
      try {
        await supabase.rpc('refresh_kpi_daily', { p_date: new Date().toISOString().split('T')[0] });
      } catch (error) {
        console.error('Failed to refresh KPIs:', error);
      }
    };
    refreshKPIs();
  }, []);
  
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiDaily(dateRange);
  const { data: topSuppliers, isLoading: suppliersLoading } = useTopSuppliers(dateRange);
  const { data: topCategories, isLoading: categoriesLoading } = useTopCategories(dateRange);
  const { data: kpiSummary, isLoading: summaryLoading, error: summaryError } = useKpiSummary(dateRange);
  
  const auditMutation = useAdminAudit();
  const refreshMutation = useRefreshData();

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    auditMutation.mutate({ event_type: 'dashboard_filter_change', event_data: { from: newRange.from.toISOString(), to: newRange.to.toISOString() } });
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
    auditMutation.mutate({ event_type: 'dashboard_manual_refresh', event_data: { timestamp: new Date().toISOString() } });
  };

  const isLoading = kpiLoading || suppliersLoading || categoriesLoading || summaryLoading;
  const hasError = kpiError || summaryError;

  if (hasError) {
    return (
      <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-destructive font-semibold">שגיאה בטעינת נתונים</p>
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              {refreshMutation.isPending ? "מרענן..." : "נסה שוב"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    { label: 'ניהול ספקים', path: '/admin/suppliers', icon: Users },
    { label: 'ניהול לקוחות', path: '/admin/customers', icon: Users },
    { label: 'הזמנות', path: '/admin/orders', icon: ShoppingCart },
    { label: 'תמיכה', path: '/admin/support', icon: Activity },
  ];

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">לוח בקרה</h1>
          <p className="text-muted-foreground text-sm">סקירה כללית של ביצועי הפלטפורמה</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={cn("h-4 w-4 ml-1", refreshMutation.isPending && "animate-spin")} />
            רענן
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={refreshMutation.isPending}
      />

      {/* KPI Cards */}
      <KpiCards data={kpiSummary} loading={summaryLoading} error={summaryError} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.path}
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">הרשמות חדשות</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <SignupsChart data={kpiData || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">משתמשים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <ActiveUsersChart data={kpiData || []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Tables + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Suppliers */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">ספקים מובילים</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/suppliers')} className="text-xs gap-1">
              הכל <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : topSuppliers && topSuppliers.length > 0 ? (
              <div className="space-y-2">
                {topSuppliers.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm truncate max-w-[140px]">{s.name || 'ללא שם'}</span>
                    <Badge variant="secondary" className="text-xs">{s.orders} הזמנות</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">אין נתונים</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">משתמשים חדשים</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/customers')} className="text-xs gap-1">
              הכל <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <RecentSignupsTable />
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              בריאות המערכת
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealthCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
