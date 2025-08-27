import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  ShoppingCart, 
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KpiSummary } from '@/types/kpi';

interface KpiCardsProps {
  data?: KpiSummary;
  loading?: boolean;
  error?: Error | null;
}

const KpiCardSkeleton = () => (
  <Card className="mobile-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4 rounded" />
    </CardHeader>
    <CardContent className="p-3 md:p-6">
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString('he-IL');
};

const formatCurrency = (amount: number): string => {
  return `₪${formatNumber(amount)}`;
};

const ChangeIndicator: React.FC<{ change: number; className?: string }> = ({ change, className }) => {
  if (change === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}>
        <Minus className="h-3 w-3" />
        אין שינוי
      </span>
    );
  }

  const isPositive = change > 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1",
      isPositive ? "text-green-600" : "text-red-600",
      className
    )}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(change)}%
    </span>
  );
};

export const KpiCards: React.FC<KpiCardsProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="responsive-grid-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="responsive-grid-2">
        <Card className="mobile-card col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">שגיאה בטעינת נתוני KPI</p>
            <p className="text-sm text-red-600 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="responsive-grid-2">
        <Card className="mobile-card col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">אין נתונים זמינים</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiData = [
    {
      title: "סה״כ משתמשים",
      value: formatNumber(data.total_users),
      change: data.users_change,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "סה״כ ספקים",
      value: formatNumber(data.total_suppliers),
      change: data.suppliers_change,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "הזמנות בתקופה",
      value: formatNumber(data.total_orders),
      change: data.orders_change,
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "הכנסות בתקופה",
      value: formatCurrency(data.total_revenue),
      change: data.revenue_change,
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="responsive-grid-2">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="mobile-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={cn("h-4 w-4 flex-shrink-0", kpi.color)} />
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold text-right mb-1">
              {kpi.value}
            </div>
            <div className="text-mobile-xs md:text-xs text-right">
              <ChangeIndicator change={kpi.change} />
              <span className="text-muted-foreground mr-2">מהתקופה הקודמת</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};