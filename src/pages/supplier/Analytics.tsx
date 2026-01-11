import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, Users, Eye, Clock, Award, ShoppingBag, DollarSign, MessageCircle, PieChart as PieChartIcon } from 'lucide-react';
import { supplierAnalyticsService, SupplierAnalyticsService, type AnalyticsKPIs, type LeadsBySource, type OrdersByStatus, type GmvByPeriod, type TopProduct } from '@/services/supplierAnalyticsService';
import { showToast } from '@/utils/toast';

interface AnalyticsData {
  kpis: AnalyticsKPIs | null;
  leadsBySource: LeadsBySource[];
  ordersByStatus: OrdersByStatus[];
  gmvByWeek: GmvByPeriod[];
  topProducts: TopProduct[];
}

export default function SupplierAnalytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    kpis: null,
    leadsBySource: [],
    ordersByStatus: [],
    gmvByWeek: [],
    topProducts: [],
  });

  const loadAnalytics = async (period: '7d' | '30d' | '90d') => {
    try {
      setLoading(true);
      const datePreset = SupplierAnalyticsService.getDatePreset(period);
      
      const [kpis, leadsBySource, ordersByStatus, gmvByWeek, topProducts] = await Promise.all([
        supplierAnalyticsService.getKPIs(datePreset),
        supplierAnalyticsService.getLeadsBySource(datePreset),
        supplierAnalyticsService.getOrdersByStatus(datePreset),
        supplierAnalyticsService.getGmvByWeek(datePreset),
        supplierAnalyticsService.getTopProducts(datePreset),
      ]);

      setAnalyticsData({
        kpis,
        leadsBySource,
        ordersByStatus,
        gmvByWeek,
        topProducts,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showToast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange as '7d' | '30d' | '90d');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const maxGmv = Math.max(...analyticsData.gmvByWeek.map(d => d.gmv));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10 pt-[max(env(safe-area-inset-top),12px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2 min-h-[44px] p-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">חזור לדשבורד</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">סטטיסטיקות ותובנות</span>
                <span className="sm:hidden">סטטיסטיקות</span>
              </h1>
            </div>
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ימים אחרונים</SelectItem>
                <SelectItem value="30d">30 ימים אחרונים</SelectItem>
                <SelectItem value="90d">90 ימים אחרונים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-nav-safe">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">GMV {dateRange === '7d' ? 'השבוע' : dateRange === '30d' ? 'החודש' : '3 החודשים'}</p>
                  {loading ? (
                    <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-1 sm:mb-2" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{formatCurrency(analyticsData.kpis?.gmv || 0)}</p>
                  )}
                  {!loading && analyticsData.kpis && (
                    <p className={`text-[10px] sm:text-xs ${calculatePercentageChange(analyticsData.kpis.gmv, analyticsData.kpis.previousPeriodGmv) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePercentageChange(analyticsData.kpis.gmv, analyticsData.kpis.previousPeriodGmv) >= 0 ? '+' : ''}
                      {calculatePercentageChange(analyticsData.kpis.gmv, analyticsData.kpis.previousPeriodGmv)}%
                    </p>
                  )}
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">שיעור המרה</p>
                  {loading ? (
                    <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-1 sm:mb-2" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{analyticsData.kpis?.winRate || 0}%</p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">מהצעות מחיר שנשלחו</p>
                </div>
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">זמן תגובה</p>
                  {loading ? (
                    <Skeleton className="h-6 sm:h-8 w-14 sm:w-20 mb-1 sm:mb-2" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{analyticsData.kpis?.avgResponseTime.toFixed(1) || 0}ש'</p>
                  )}
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">ללידים חדשים</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">לידים חדשים</p>
                  {loading ? (
                    <Skeleton className="h-6 sm:h-8 w-10 sm:w-12 mb-1 sm:mb-2" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{analyticsData.kpis?.leadsCount || 0}</p>
                  )}
                  {!loading && analyticsData.kpis && (
                    <p className={`text-[10px] sm:text-xs ${calculatePercentageChange(analyticsData.kpis.leadsCount, analyticsData.kpis.previousPeriodLeads) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePercentageChange(analyticsData.kpis.leadsCount, analyticsData.kpis.previousPeriodLeads) >= 0 ? '+' : ''}
                      {calculatePercentageChange(analyticsData.kpis.leadsCount, analyticsData.kpis.previousPeriodLeads)}%
                    </p>
                  )}
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* GMV Chart */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                GMV לאורך זמן
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {loading ? (
                <Skeleton className="h-36 sm:h-48 w-full" />
              ) : (
                <div className="h-36 sm:h-48 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto">
                  {analyticsData.gmvByWeek.map((day, index) => (
                    <div key={index} className="flex-1 min-w-[30px] flex flex-col items-center gap-1 sm:gap-2">
                      <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{formatCurrency(day.gmv)}</div>
                      <div
                        className="bg-primary hover:bg-primary/80 transition-colors w-full rounded-t min-h-[20px] flex items-end justify-center pb-1"
                        style={{ height: maxGmv > 0 ? `${(day.gmv / maxGmv) * 100}%` : '20px' }}
                      />
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{day.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leads by Source */}
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                לידים לפי מקור
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {loading ? (
                <Skeleton className="h-36 sm:h-48 w-full" />
              ) : analyticsData.leadsBySource.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {analyticsData.leadsBySource.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
                        <span className="text-xs sm:text-sm font-medium">{source.source}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs sm:text-sm font-bold">{source.count}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{source.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-36 sm:h-48 flex items-center justify-center text-muted-foreground text-sm">
                  אין נתונים לתקופה זו
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status */}
        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              הזמנות לפי סטטוס
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? (
              <Skeleton className="h-24 sm:h-32 w-full" />
            ) : analyticsData.ordersByStatus.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {analyticsData.ordersByStatus.map((status, index) => (
                  <div key={index} className="text-center p-2 sm:p-4 rounded-lg border">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-auto mb-1 sm:mb-2"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="text-xl sm:text-2xl font-bold">{status.count}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{status.status}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{status.percentage}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 sm:h-32 flex items-center justify-center text-muted-foreground text-sm">
                אין הזמנות לתקופה זו
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              המוצרים/שירותים המובילים
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 sm:h-16 w-full" />
                ))}
              </div>
            ) : analyticsData.topProducts.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{product.views} צפיות</p>
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <div className="font-bold text-green-600 text-sm sm:text-base">{product.orders} הזמנות</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {product.conversion}% המרה
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 sm:h-32 flex items-center justify-center text-muted-foreground text-sm">
                אין נתוני מוצרים לתקופה זו
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <MessageCircle className="w-4 h-4" />
                זמן תגובה
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-center">
                {loading ? (
                  <Skeleton className="h-10 sm:h-12 w-14 sm:w-16 mx-auto mb-1 sm:mb-2" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{analyticsData.kpis?.avgResponseTime.toFixed(1) || 0}ש'</div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">ממוצע תגובה ללידים</p>
                {!loading && analyticsData.kpis && analyticsData.kpis.avgResponseTime <= 3 && (
                  <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600">מצוין! מתחת ל-3 שעות</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="w-4 h-4" />
                הזמנות פעילות
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-center">
                {loading ? (
                  <Skeleton className="h-10 sm:h-12 w-8 mx-auto mb-1 sm:mb-2" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{analyticsData.kpis?.ordersCount || 0}</div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">הזמנות בתקופה</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Award className="w-4 h-4" />
                הצעות מחיר
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-center">
                {loading ? (
                  <Skeleton className="h-10 sm:h-12 w-8 mx-auto mb-1 sm:mb-2" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">{analyticsData.kpis?.quotesCount || 0}</div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">הצעות מאושרות</p>
                {!loading && analyticsData.kpis && analyticsData.kpis.winRate > 0 && (
                  <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-purple-600">{analyticsData.kpis.winRate}% שיעור המרה</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>המלצות לשיפור</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!loading && analyticsData.kpis && analyticsData.kpis.avgResponseTime > 3 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">שפר זמני תגובה</p>
                    <p className="text-sm text-blue-600">זמן התגובה הממוצע שלך הוא {analyticsData.kpis.avgResponseTime.toFixed(1)} שעות. תגובה מהירה יותר יכולה לשפר את שיעור ההמרה</p>
                  </div>
                </div>
              )}
              
              {!loading && analyticsData.kpis && analyticsData.kpis.winRate < 50 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                  <div>
                    <p className="text-sm text-orange-800 font-medium">שפר הצעות מחיר</p>
                    <p className="text-sm text-orange-600">שיעור ההמרה שלך הוא {analyticsData.kpis.winRate}%. נסה להתאים את ההצעות לצרכי הלקוח ולשפר את הפרטים</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                <div>
                  <p className="text-sm text-green-800 font-medium">הוסף עוד תמונות</p>
                  <p className="text-sm text-green-600">מוצרים ושירותים עם יותר תמונות מקבלים פי 2.5 יותר צפיות</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}