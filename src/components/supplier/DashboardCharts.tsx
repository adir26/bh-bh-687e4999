import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TimeSeriesData, formatCurrency } from '@/hooks/useSupplierDashboard';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DashboardChartsProps {
  timeSeriesData?: TimeSeriesData[];
  loading: boolean;
  error?: Error | null;
  granularity: 'day' | 'week' | 'month';
}

const ChartSkeleton: React.FC = () => (
  <Card className="mobile-card">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="h-80 w-full">
        <Skeleton className="h-full w-full" />
      </div>
    </CardContent>
  </Card>
);

const formatXAxisDate = (dateStr: string, granularity: 'day' | 'week' | 'month') => {
  const date = new Date(dateStr);
  
  switch (granularity) {
    case 'day':
      return format(date, 'd/M', { locale: he });
    case 'week':
      return format(date, 'd/M', { locale: he });
    case 'month':
      return format(date, 'MMM yyyy', { locale: he });
    default:
      return format(date, 'd/M', { locale: he });
  }
};

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  granularity,
  formatValue = (value) => value?.toLocaleString('he-IL') || '0'
}: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = format(date, 'PPP', { locale: he });

    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm" dir="rtl">
        <p className="font-medium text-foreground mb-2">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  timeSeriesData,
  loading,
  error,
  granularity
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mobile-card">
        <CardContent className="mobile-padding text-center text-red-600">
          שגיאה בטעינת נתוני הגרפים: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <Card className="mobile-card">
        <CardContent className="mobile-padding text-center text-muted-foreground">
          אין נתונים זמינים לתצוגת גרפים
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = timeSeriesData.map(item => ({
    ...item,
    date: item.bucket,
    formattedDate: formatXAxisDate(item.bucket, granularity)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold" dir="rtl">הכנסות לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={
                    <CustomTooltip 
                      granularity={granularity}
                      formatValue={(value: number) => formatCurrency(value)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="הכנסות"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Leads Chart */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold" dir="rtl">לידים לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip granularity={granularity} />}
                />
                <Bar
                  dataKey="leads_count"
                  name="לידים"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Orders Chart */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold" dir="rtl">הזמנות לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip granularity={granularity} />}
                />
                <Bar
                  dataKey="orders_count"
                  name="הזמנות"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profile Views Chart */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold" dir="rtl">צפיות בפרופיל</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip granularity={granularity} />}
                />
                <Line
                  type="monotone"
                  dataKey="profile_views"
                  name="צפיות"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="reviews_count"
                  name="ביקורות"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};