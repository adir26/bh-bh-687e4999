import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  ShoppingBag, 
  Package, 
  DollarSign,
  Star,
  MessageSquare,
  Timer
} from 'lucide-react';
import { 
  DashboardMetrics, 
  formatCurrency, 
  formatPercentage, 
  calculatePercentageChange 
} from '@/hooks/useSupplierDashboard';
import { useNavigate } from 'react-router-dom';

interface DashboardKPIsProps {
  metrics?: DashboardMetrics;
  loading: boolean;
  error?: Error | null;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo';
  navigateTo?: string;
  badge?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  navigateTo,
  badge 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
      green: 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400',
      orange: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400',
      purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400',
      red: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
      indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card 
      className={`mobile-card hover-lift transition-all duration-200 ${
        navigateTo ? 'cursor-pointer hover:border-primary/20' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="mobile-padding">
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </p>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
              </p>
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  {change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                  )}
                  <span className={`text-xs font-medium ${
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change >= 0 ? '+' : ''}{formatPercentage(change)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const KPISkeleton: React.FC = () => (
  <Card className="mobile-card">
    <CardContent className="mobile-padding">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ 
  metrics, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mobile-card">
        <CardContent className="mobile-padding text-center text-red-600">
          שגיאה בטעינת הנתונים: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="mobile-card">
        <CardContent className="mobile-padding text-center text-muted-foreground">
          אין נתונים זמינים
        </CardContent>
      </Card>
    );
  }

  const revenueChange = calculatePercentageChange(metrics.revenue, metrics.prev_revenue);
  const ordersChange = calculatePercentageChange(metrics.orders_completed, metrics.prev_orders_completed);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* New Leads */}
      <KPICard
        title="לידים חדשים"
        value={metrics.leads_new}
        icon={<Users className="h-6 w-6" />}
        color="blue"
        navigateTo="/supplier/lead-management"
      />

      {/* Leads In Progress */}
      <KPICard
        title="לידים בתהליך"
        value={metrics.leads_in_progress}
        icon={<Clock className="h-6 w-6" />}
        color="orange"
        navigateTo="/supplier/lead-management?status=in_progress"
      />

      {/* Lead Conversion Rate */}
      <KPICard
        title="שיעור המרה"
        value={formatPercentage(metrics.lead_conversion_rate)}
        icon={<TrendingUp className="h-6 w-6" />}
        color="green"
      />

      {/* Quotes Sent */}
      <KPICard
        title="הצעות שנשלחו"
        value={metrics.quotes_sent}
        icon={<FileText className="h-6 w-6" />}
        color="purple"
        navigateTo="/supplier/quote-builder"
      />

      {/* Quotes Accepted */}
      <KPICard
        title="הצעות שהתקבלו"
        value={metrics.quotes_accepted}
        icon={<CheckCircle className="h-6 w-6" />}
        color="green"
        navigateTo="/supplier/quote-builder?status=accepted"
      />

      {/* Active Orders */}
      <KPICard
        title="הזמנות פעילות"
        value={metrics.orders_active}
        icon={<ShoppingBag className="h-6 w-6" />}
        color="indigo"
        navigateTo="/supplier/order-management?status=active"
      />

      {/* Completed Orders */}
      <KPICard
        title="הזמנות שהושלמו"
        value={metrics.orders_completed}
        change={ordersChange}
        icon={<Package className="h-6 w-6" />}
        color="green"
        navigateTo="/supplier/order-management?status=completed"
      />

      {/* Revenue */}
      <KPICard
        title="הכנסות"
        value={formatCurrency(metrics.revenue)}
        change={revenueChange}
        icon={<DollarSign className="h-6 w-6" />}
        color="green"
      />

      {/* Average Order Value */}
      <KPICard
        title="ערך הזמנה ממוצע"
        value={formatCurrency(metrics.aov)}
        icon={<TrendingUp className="h-6 w-6" />}
        color="blue"
      />

      {/* Average Rating */}
      <KPICard
        title="דירוג ממוצע"
        value={metrics.rating_avg.toFixed(1)}
        icon={<Star className="h-6 w-6" />}
        color="orange"
        badge={`${metrics.reviews_count} ביקורות`}
      />

      {/* Reviews Count */}
      <KPICard
        title="מספר ביקורות"
        value={metrics.reviews_count}
        icon={<MessageSquare className="h-6 w-6" />}
        color="purple"
      />

      {/* Average Response Time */}
      <KPICard
        title="זמן תגובה ממוצע"
        value={`${metrics.avg_response_time_hours} שעות`}
        icon={<Timer className="h-6 w-6" />}
        color={metrics.avg_response_time_hours > 24 ? 'red' : 'green'}
        badge={metrics.avg_response_time_hours > 24 ? 'דורש שיפור' : 'מעולה'}
      />
    </div>
  );
};