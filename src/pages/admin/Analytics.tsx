import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  Users, 
  UserPlus,
  BarChart
} from "lucide-react";
import { useKpiDaily, useKpiSummary } from "@/hooks/useAdminKpis";
import { getDateRangeFromPreset } from "@/hooks/useAdminKpis";
import { useMemo } from "react";

export default function AdminAnalytics() {
  // Get last 30 days of data
  const dateRange = useMemo(() => getDateRangeFromPreset('30d'), []);
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKpiDaily(dateRange);
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useKpiSummary(dateRange);

  const isLoading = kpiLoading || summaryLoading;
  const error = kpiError || summaryError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-nav-safe">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">אנליטיקה</h1>
          <p className="text-destructive">שגיאה בטעינת נתונים. אנא נסה שוב.</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!kpiData || kpiData.length === 0) {
    return (
      <div className="space-y-6 pb-nav-safe">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">אנליטיקה</h1>
          <p className="text-muted-foreground">תובנות ביצועים מקיפות</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">אין נתונים זמינים</h3>
              <p className="text-sm text-muted-foreground">
                נתונים יופיעו כאן לאחר שיצטברו אירועים ופעילות במערכת
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Summary metrics
  const totalSignups = kpiData.reduce((sum, item) => sum + item.signups_total, 0);
  const totalSupplierSignups = kpiData.reduce((sum, item) => sum + item.signups_suppliers, 0);
  const totalCustomerSignups = kpiData.reduce((sum, item) => sum + item.signups_customers, 0);
  const avgDAU = Math.round(kpiData.reduce((sum, item) => sum + item.dau, 0) / kpiData.length);
  const avgWAU = Math.round(kpiData.reduce((sum, item) => sum + item.wau, 0) / kpiData.length);
  const avgMAU = Math.round(kpiData.reduce((sum, item) => sum + item.mau, 0) / kpiData.length);

  const topMetrics = [
    { 
      title: "סה\"כ הרשמות", 
      value: totalSignups.toLocaleString(), 
      change: summary ? `${summary.users_change > 0 ? '+' : ''}${summary.users_change.toFixed(1)}%` : 'N/A',
      icon: UserPlus, 
      color: "text-green-600" 
    },
    { 
      title: "ממוצע DAU", 
      value: avgDAU.toLocaleString(), 
      change: "יומי",
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "ממוצע WAU", 
      value: avgWAU.toLocaleString(), 
      change: "שבועי",
      icon: Users, 
      color: "text-purple-600" 
    },
    { 
      title: "ממוצע MAU", 
      value: avgMAU.toLocaleString(), 
      change: "חודשי",
      icon: TrendingUp, 
      color: "text-orange-600" 
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 pb-nav-safe">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">אנליטיקה</h1>
        <p className="text-muted-foreground">תובנות ביצועים - 30 ימים אחרונים</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">הרשמות ספקים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSupplierSignups}</div>
            <p className="text-sm text-muted-foreground mt-1">30 ימים אחרונים</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-right">הרשמות לקוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomerSignups}</div>
            <p className="text-sm text-muted-foreground mt-1">30 ימים אחרונים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">יחס ספקים/לקוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalCustomerSignups > 0 
                ? (totalSupplierSignups / totalCustomerSignups).toFixed(2) 
                : '0'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">ספק לכל לקוח</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily KPI Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">נתוני KPI יומיים - 30 ימים אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סה"כ הרשמות</TableHead>
                  <TableHead className="text-right">ספקים</TableHead>
                  <TableHead className="text-right">לקוחות</TableHead>
                  <TableHead className="text-right">DAU</TableHead>
                  <TableHead className="text-right">WAU</TableHead>
                  <TableHead className="text-right">MAU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiData.slice(0, 30).reverse().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right font-medium">
                      {formatDate(item.d)}
                    </TableCell>
                    <TableCell className="text-right">{item.signups_total}</TableCell>
                    <TableCell className="text-right">{item.signups_suppliers}</TableCell>
                    <TableCell className="text-right">{item.signups_customers}</TableCell>
                    <TableCell className="text-right">{item.dau}</TableCell>
                    <TableCell className="text-right">{item.wau}</TableCell>
                    <TableCell className="text-right">{item.mau}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">הסבר מדדים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground text-right">
            <p><strong>DAU (Daily Active Users):</strong> משתמשים שנכנסו למערכת היום</p>
            <p><strong>WAU (Weekly Active Users):</strong> משתמשים שנכנסו למערכת ב-7 ימים האחרונים</p>
            <p><strong>MAU (Monthly Active Users):</strong> משתמשים שנכנסו למערכת ב-30 ימים האחרונים</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
