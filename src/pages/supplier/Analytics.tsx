import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Users, Eye, Clock, Award, ShoppingBag, DollarSign, MessageCircle } from 'lucide-react';

export default function SupplierAnalytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');

  // Mock data - in real app this would come from API
  const metrics = {
    leadsThisWeek: 12,
    leadsThisMonth: 45,
    conversionRate: 75,
    avgResponseTime: 2.5,
    profileViews: 324,
    productViews: 587,
    topProducts: [
      { name: 'עיצוב מטבח מלא', views: 156, orders: 8 },
      { name: 'שיפוץ חדר אמבטיה', views: 134, orders: 5 },
      { name: 'עיצוב סלון', views: 98, orders: 3 },
      { name: 'ייעוץ צבעים', views: 67, orders: 2 },
    ]
  };

  const weeklyData = [
    { day: 'א\'', leads: 2, views: 45 },
    { day: 'ב\'', leads: 1, views: 52 },
    { day: 'ג\'', leads: 3, views: 38 },
    { day: 'ד\'', leads: 2, views: 61 },
    { day: 'ה\'', leads: 1, views: 43 },
    { day: 'ו\'', leads: 2, views: 48 },
    { day: 'ש\'', leads: 1, views: 37 },
  ];

  const maxLeads = Math.max(...weeklyData.map(d => d.leads));
  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור לדשבורד
              </Button>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                סטטיסטיקות ותובנות
              </h1>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ימים אחרונים</SelectItem>
                <SelectItem value="30days">30 ימים אחרונים</SelectItem>
                <SelectItem value="3months">3 חודשים אחרונים</SelectItem>
                <SelectItem value="year">שנה אחרונה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">לידים השבוע</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.leadsThisWeek}</p>
                  <p className="text-xs text-green-600">+15% מהשבוע הקודם</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">שיעור המרה</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.conversionRate}%</p>
                  <p className="text-xs text-green-600">+5% מהחודש הקודם</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">זמן תגובה ממוצע</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.avgResponseTime}ש'</p>
                  <p className="text-xs text-green-600">-0.5ש' מהשבוע הקודם</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">צפיות בפרופיל</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.profileViews}</p>
                  <p className="text-xs text-green-600">+23% מהשבוע הקודם</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Leads Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                לידים השבוע
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-muted-foreground">{day.leads}</div>
                    <div
                      className="bg-blue-500 hover:bg-blue-600 transition-colors w-full rounded-t min-h-[20px] flex items-end justify-center pb-1"
                      style={{ height: `${(day.leads / maxLeads) * 100}%` }}
                    />
                    <div className="text-xs text-muted-foreground">{day.day}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                צפיות השבוע
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-muted-foreground">{day.views}</div>
                    <div
                      className="bg-purple-500 hover:bg-purple-600 transition-colors w-full rounded-t min-h-[20px] flex items-end justify-center pb-1"
                      style={{ height: `${(day.views / maxViews) * 100}%` }}
                    />
                    <div className="text-xs text-muted-foreground">{day.day}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              המוצרים המובילים שלך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.views} צפיות החודש</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-green-600">{product.orders} הזמנות</div>
                    <div className="text-sm text-muted-foreground">
                      {((product.orders / product.views) * 100).toFixed(1)}% המרה
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="w-4 h-4" />
                זמן תגובה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.avgResponseTime}ש'</div>
                <p className="text-sm text-muted-foreground">ממוצע תגובה ללידים</p>
                <div className="mt-2 text-xs text-green-600">מצוין! מתחת ל-3 שעות</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="w-4 h-4" />
                הזמנות פעילות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">7</div>
                <p className="text-sm text-muted-foreground">הזמנות בתהליך</p>
                <div className="mt-2 text-xs text-blue-600">3 יורדות במשלוח השבוע</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4" />
                הכנסות צפויות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">₪32,500</div>
                <p className="text-sm text-muted-foreground">החודש</p>
                <div className="mt-2 text-xs text-purple-600">+18% מהחודש הקודם</div>
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">שפר זמני תגובה</p>
                  <p className="text-sm text-blue-600">התגובה הממוצעת שלך טובה, אבל ניסיון להגיב תוך שעה יכול להגדיל את שיעור ההמרה</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                <div>
                  <p className="text-sm text-green-800 font-medium">הוסף עוד תמונות</p>
                  <p className="text-sm text-green-600">מוצרים עם יותר תמונות מקבלים פי 2.5 יותר צפיות</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                <div>
                  <p className="text-sm text-purple-800 font-medium">עדכן פרטי פרופיל</p>
                  <p className="text-sm text-purple-600">פרופילים מעודכנים מקבלים יותר אמון מהלקוחות</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}