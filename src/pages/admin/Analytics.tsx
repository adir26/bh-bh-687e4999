import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, Users, UserPlus, BarChart, Activity
} from "lucide-react";
import { useKpiDaily, useKpiSummary, getDateRangeFromPreset } from "@/hooks/useAdminKpis";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DateRange } from "@/types/kpi";
import { 
  AreaChart, Area, BarChart as ReBarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('30d'));
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiDaily(dateRange);
  const { data: summary, isLoading: summaryLoading } = useKpiSummary(dateRange);

  const isLoading = kpiLoading || summaryLoading;

  const chartData = useMemo(() => {
    if (!kpiData) return [];
    return kpiData.map(d => ({
      date: format(new Date(d.d), 'dd/MM'),
      fullDate: format(new Date(d.d), 'dd/MM/yyyy'),
      suppliers: d.signups_suppliers,
      customers: d.signups_customers,
      total: d.signups_total,
      dau: d.dau,
      wau: d.wau,
      mau: d.mau,
    }));
  }, [kpiData]);

  const totalSignups = kpiData?.reduce((s, i) => s + i.signups_total, 0) || 0;
  const totalSupplierSignups = kpiData?.reduce((s, i) => s + i.signups_suppliers, 0) || 0;
  const totalCustomerSignups = kpiData?.reduce((s, i) => s + i.signups_customers, 0) || 0;
  const avgDAU = kpiData && kpiData.length > 0 ? Math.round(kpiData.reduce((s, i) => s + i.dau, 0) / kpiData.length) : 0;
  const avgWAU = kpiData && kpiData.length > 0 ? Math.round(kpiData.reduce((s, i) => s + i.wau, 0) / kpiData.length) : 0;
  const avgMAU = kpiData && kpiData.length > 0 ? Math.round(kpiData.reduce((s, i) => s + i.mau, 0) / kpiData.length) : 0;

  if (kpiError) {
    return (
      <div className="space-y-6 pb-nav-safe font-hebrew" dir="rtl">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">אנליטיקה</h1>
        <Card><CardContent className="p-6 text-center"><p className="text-destructive">שגיאה בטעינת נתונים</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-nav-safe font-hebrew" dir="rtl">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">אנליטיקה</h1>
        <p className="text-muted-foreground text-sm">תובנות ביצועים מקיפות</p>
      </div>

      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => {}}
        isRefreshing={false}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'סה"כ הרשמות', value: totalSignups, icon: UserPlus },
          { label: 'ספקים חדשים', value: totalSupplierSignups, icon: Users },
          { label: 'לקוחות חדשים', value: totalCustomerSignups, icon: Users },
          { label: 'ממוצע DAU', value: avgDAU, icon: Activity },
          { label: 'ממוצע WAU', value: avgWAU, icon: TrendingUp },
          { label: 'ממוצע MAU', value: avgMAU, icon: BarChart },
        ].map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-1">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{isLoading ? <Skeleton className="h-7 w-16" /> : metric.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="signups" dir="rtl">
        <TabsList>
          <TabsTrigger value="signups">הרשמות</TabsTrigger>
          <TabsTrigger value="active">משתמשים פעילים</TabsTrigger>
          <TabsTrigger value="engagement">מעורבות</TabsTrigger>
        </TabsList>

        <TabsContent value="signups">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">הרשמות לפי יום</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="suppliers" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.4} name="ספקים" />
                    <Area type="monotone" dataKey="customers" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} name="לקוחות" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">משתמשים פעילים לפי יום</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="dau" fill="hsl(var(--chart-3))" name="DAU" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wau" fill="hsl(var(--chart-4))" name="WAU" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">מגמת MAU</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="mau" stroke="hsl(var(--chart-5))" strokeWidth={2} name="MAU" dot={false} />
                    <Line type="monotone" dataKey="dau" stroke="hsl(var(--chart-1))" strokeWidth={2} name="DAU" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">הרשמות ספקים</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : totalSupplierSignups}</div>
            <p className="text-sm text-muted-foreground mt-1">בתקופה הנבחרת</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">הרשמות לקוחות</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : totalCustomerSignups}</div>
            <p className="text-sm text-muted-foreground mt-1">בתקופה הנבחרת</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">יחס ספקים/לקוחות</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : totalCustomerSignups > 0 ? (totalSupplierSignups / totalCustomerSignups).toFixed(2) : '0'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">ספק לכל לקוח</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Explanation */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">הסבר מדדים</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p><strong>DAU:</strong> משתמשים שנכנסו למערכת היום</p>
            <p><strong>WAU:</strong> משתמשים שנכנסו ב-7 ימים אחרונים</p>
            <p><strong>MAU:</strong> משתמשים שנכנסו ב-30 ימים אחרונים</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
