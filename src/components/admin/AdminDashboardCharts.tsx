import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { KpiData, TopSupplier, TopCategory } from '@/types/kpi';

interface AdminDashboardChartsProps {
  kpiData?: KpiData[];
  topSuppliers?: TopSupplier[];
  topCategories?: TopCategory[];
  loading?: boolean;
  error?: Error | null;
}

const ChartSkeleton = () => (
  <Card className="mobile-card">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="h-[200px] md:h-[300px]">
        <Skeleton className="w-full h-full" />
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg" dir="rtl">
        <p className="font-medium mb-2">
          {format(new Date(label), 'PPP', { locale: he })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString('he-IL')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Function to export data as CSV
const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '_')];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({
  kpiData = [],
  topSuppliers = [],
  topCategories = [],
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <ChartSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mobile-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">שגיאה בטעינת גרפים</p>
          <p className="text-sm text-red-600 mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const revenueChartData = kpiData.map(item => ({
    date: item.date,
    הכנסות: item.revenue_ils,
    הזמנות: item.orders_count,
  }));

  const suppliersTableData = topSuppliers.slice(0, 10).map(supplier => ({
    name: supplier.name,
    orders: supplier.orders,
    gmv_ils: supplier.gmv_ils,
    revenue_ils: supplier.revenue_ils,
  }));

  const categoryChartData = topCategories.map((cat, index) => ({
    name: cat.category_name,
    value: cat.gmv_ils,
    color: [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
      '#00C49F', '#FFBB28', '#FF8042', '#0088FE',
      '#00C49F', '#FFBB28'
    ][index % 10]
  }));

  return (
    <div className="space-y-6">
      {/* Revenue and Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">
              מגמות הכנסות והזמנות יומיות
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(
                revenueChartData, 
                'revenue_trends', 
                ['date', 'revenue', 'orders']
              )}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="הכנסות" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="הכנסות יומיות"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="הזמנות" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="הזמנות יומיות"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">
              התפלגות קטגוריות מובילות
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(
                topCategories, 
                'top_categories', 
                ['category_name', 'orders', 'gmv_ils']
              )}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers Table */}
      <Card className="mobile-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-right font-hebrew text-mobile-sm md:text-base">
            ספקים מובילים (30 יום)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(
              suppliersTableData, 
              'top_suppliers', 
              ['name', 'orders', 'gmv_ils', 'revenue_ils']
            )}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </CardHeader>
        <CardContent>
          {suppliersTableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2 font-medium">ספק</th>
                    <th className="text-right p-2 font-medium">הזמנות</th>
                    <th className="text-right p-2 font-medium">GMV</th>
                    <th className="text-right p-2 font-medium">הכנסה</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliersTableData.map((supplier, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{supplier.name}</td>
                      <td className="p-2">{supplier.orders.toLocaleString('he-IL')}</td>
                      <td className="p-2">₪{supplier.gmv_ils.toLocaleString('he-IL')}</td>
                      <td className="p-2">₪{supplier.revenue_ils.toLocaleString('he-IL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              אין נתוני ספקים זמינים
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};