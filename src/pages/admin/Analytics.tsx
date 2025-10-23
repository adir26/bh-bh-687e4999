import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  UserPlus
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

  // Prepare data for charts
  const signupData = kpiData.map(item => ({
    date: new Date(item.d).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
    total: item.signups_total,
    suppliers: item.signups_suppliers,
    customers: item.signups_customers,
  }));

  const activityData = kpiData.map(item => ({
    date: new Date(item.d).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
    dau: item.dau,
    wau: item.wau,
    mau: item.mau,
  }));

  // Summary metrics
  const totalSignups = kpiData.reduce((sum, item) => sum + item.signups_total, 0);
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
      change: "+0%",
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "ממוצע WAU", 
      value: avgWAU.toLocaleString(), 
      change: "+0%",
      icon: Users, 
      color: "text-purple-600" 
    },
    { 
      title: "ממוצע MAU", 
      value: avgMAU.toLocaleString(), 
      change: "+0%",
      icon: TrendingUp, 
      color: "text-orange-600" 
    },
  ];

  return (
    <div className="space-y-6 pb-nav-safe">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">אנליטיקה</h1>
        <p className="text-muted-foreground">תובנות ביצועים מקיפות - 30 ימים אחרונים</p>
      </div>

      {/* Top Metrics */}
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
              <p className="text-xs text-muted-foreground">
                <span className={metric.change.startsWith('+') ? "text-green-600" : "text-muted-foreground"}>
                  {metric.change}
                </span> לעומת תקופה קודמת
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="signups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signups">הרשמות</TabsTrigger>
          <TabsTrigger value="activity">פעילות משתמשים</TabsTrigger>
        </TabsList>

        <TabsContent value="signups" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>הרשמות יומיות - 30 ימים אחרונים</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={signupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#8884d8" name="לקוחות" stackId="a" />
                    <Bar dataKey="suppliers" fill="#82ca9d" name="ספקים" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DAU - משתמשים פעילים יומית</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="dau" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WAU & MAU - פעילות שבועית וחודשית</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="wau" stroke="#82ca9d" strokeWidth={2} name="WAU" />
                    <Line type="monotone" dataKey="mau" stroke="#ffc658" strokeWidth={2} name="MAU" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>מידע נוסף</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>DAU (Daily Active Users):</strong> משתמשים שנכנסו למערכת היום</p>
                <p><strong>WAU (Weekly Active Users):</strong> משתמשים שנכנסו למערכת ב-7 ימים האחרונים</p>
                <p><strong>MAU (Monthly Active Users):</strong> משתמשים שנכנסו למערכת ב-30 ימים האחרונים</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
