import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierHeader } from '@/components/SupplierHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supplierService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { showToast } from '@/utils/toast';
import { Plus, Edit, Upload, Bell, Star, TrendingUp, Users, ShoppingBag, DollarSign, AlertCircle, Eye, FileText, Package2, Package, Briefcase, Settings, ClipboardCheck, Camera, ExternalLink, ImageIcon } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { withTimeout } from '@/lib/withTimeout';
import { ProfileCompletionCard } from '@/components/supplier/ProfileCompletionCard';
import { RecentActivityFeed } from '@/components/supplier/RecentActivityFeed';

const quickActions = [
  { title: 'עריכת פרופיל חברה', icon: Edit, path: '/supplier/profile' },
  { title: 'צפה בפרופיל הציבורי', icon: ExternalLink, path: '/supplier/profile', external: true },
  { title: 'העלאת תמונות השראה', icon: Camera, path: '/supplier/my-photos' },
  { title: 'דוחות', icon: ClipboardCheck, path: '/inspection/dashboard' },
  { title: 'הצעות מחיר', icon: FileText, path: '/supplier/quotes' },
  { title: 'ניהול הזמנות', icon: Package2, path: '/supplier/orders' },
  { title: 'נהל לידים', icon: Users, path: '/supplier/leads' },
  { title: 'סטטיסטיקות', icon: TrendingUp, path: '/supplier/analytics' },
  { title: 'קטלוג מוצרים', icon: Package, path: '/supplier/catalog' },
  { title: 'CRM מתקדם', icon: Briefcase, path: '/supplier/crm' },
  { title: 'הגדרות התראות', icon: Settings, path: '/supplier/notification-settings' },
];

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

// Fetch supplier stats with React Query (with timeout)
  const statsQuery = useQuery({
    queryKey: ['supplier-stats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const supplierStats = await withTimeout(
          supplierService.getSupplierStats(user!.id),
          12_000
        );
        
        return [
          { title: 'לידים חדשים השבוע', value: supplierStats.newLeadsThisWeek.toString(), icon: Users, color: 'text-blue-600' },
          { title: 'הזמנות פעילות', value: supplierStats.activeOrders.toString(), icon: ShoppingBag, color: 'text-green-600' },
          { title: 'דירוג ממוצע', value: supplierStats.avgRating, icon: Star, color: 'text-yellow-600' },
          { title: 'הכנסות צפויות החודש', value: `₪${supplierStats.thisMonthRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600' },
        ];
      } catch (error: any) {
        // Handle missing tables/functions gracefully
        if (error.message?.includes('relation') || 
            error.message?.includes('does not exist') || 
            error.message?.includes('function')) {
          // Return default stats for missing database tables
          return [
            { title: 'לידים חדשים השבוע', value: '0', icon: Users, color: 'text-blue-600' },
            { title: 'הזמנות פעילות', value: '0', icon: ShoppingBag, color: 'text-green-600' },
            { title: 'דירוג ממוצע', value: '0', icon: Star, color: 'text-yellow-600' },
            { title: 'הכנסות צפויות החודש', value: '₪0', icon: DollarSign, color: 'text-purple-600' },
          ];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - match global config
  });

// Dynamic "Needs Attention" data (with timeout)
  const needsAttentionQuery = useQuery({
    queryKey: ['needs-attention', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];

      const [newLeadsRes, pendingOrdersRes, reviewsRes] = await withTimeout(
        Promise.all([
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('supplier_id', user.id)
            .in('status', ['new', 'contacted']),
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('supplier_id', user.id)
            .eq('status', 'pending'),
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('reviewed_id', user.id)
        ]),
        12_000
      );

      return [
        { title: 'לידים חדשים', count: newLeadsRes.count || 0, urgent: (newLeadsRes.count || 0) > 0 },
        { title: 'הזמנות ממתינות לתגובה', count: pendingOrdersRes.count || 0, urgent: (pendingOrdersRes.count || 0) > 0 },
        { title: 'ביקורות ממתינות למענה', count: reviewsRes.count || 0, urgent: false },
      ];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

// Dynamic smart suggestions based on profile completeness (with timeout)
  const suggestionsQuery = useQuery({
    queryKey: ['smart-suggestions', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];

      const [company, reviewCount] = await withTimeout(
        Promise.all([
          supabase
            .from('companies')
            .select('description, logo_url, gallery, business_hours')
            .eq('owner_id', user.id)
            .maybeSingle(),
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('reviewed_id', user.id)
            .then(res => res.count || 0)
        ]),
        12_000
      );

      const suggestions: string[] = [];

      if (!company?.data?.description || company.data.description.length < 50) {
        suggestions.push('שפר את תיאור החברה שלך כדי לקבל יותר לידים');
      }
      
      if (!company?.data?.logo_url) {
        suggestions.push('הוסף לוגו לחברה כדי להגביר אמון');
      }

      const galleryLength = Array.isArray(company?.data?.gallery) ? company.data.gallery.length : 0;
      if (galleryLength < 5) {
        suggestions.push(`הוסף עוד תמונות איכות לגלריה (יש לך ${galleryLength}/5)`);
      }

      if (!company?.data?.business_hours || Object.keys(company.data.business_hours).length === 0) {
        suggestions.push('הגדר שעות עבודה כדי להגביר נראות');
      }

      if ((reviewCount || 0) < 5) {
        suggestions.push('בקש מלקוחות מרוצים להשאיר ביקורות');
      }

      return suggestions.length > 0 ? suggestions : ['הפרופיל שלך נראה מעולה! המשך כך 🎉'];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Dynamic profile views data (with timeout)
  const profileViewsQuery = useQuery({
    queryKey: ['profile-views-week', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return Array(7).fill(0);

      // Get company_id first
      const companyRes = await withTimeout(
        supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle(),
        12_000
      );

      const company = companyRes.data;
      if (!company) return Array(7).fill(0);

      // Get last 7 days of profile views
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const analyticsRes = await withTimeout(
        supabase
          .from('company_analytics')
          .select('metric_value, metric_date')
          .eq('company_id', company.id)
          .eq('metric_name', 'profile_view')
          .gte('metric_date', sevenDaysAgo.toISOString().split('T')[0])
          .order('metric_date', { ascending: true }),
        12_000
      );

      const analytics = analyticsRes.data;

      // Fill missing days with 0
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const viewsByDay = last7Days.map(date => {
        const found = analytics?.find((a: any) => a.metric_date === date);
        return found ? Number(found.metric_value) : 0;
      });

      // Normalize to percentages for the graph (0-100%)
      const maxViews = Math.max(...viewsByDay, 1);
      return viewsByDay.map(views => Math.round((views / maxViews) * 100));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Aggregate loading and error states to prevent legacy PageBoundary timeout screen
  const isLoading =
    statsQuery.status === 'pending' ||
    needsAttentionQuery.status === 'pending' ||
    suggestionsQuery.status === 'pending' ||
    profileViewsQuery.status === 'pending';

  const firstError: any =
    statsQuery.error ||
    needsAttentionQuery.error ||
    suggestionsQuery.error ||
    profileViewsQuery.error;

return (
    <PageBoundary isLoading={isLoading} isError={!!firstError} error={firstError} onRetry={() => {
      statsQuery.refetch();
      needsAttentionQuery.refetch();
      suggestionsQuery.refetch();
      profileViewsQuery.refetch();
    }}>
      <div className="min-h-screen bg-background" dir="rtl">
        <SupplierHeader 
          title={`שלום, ${profile?.full_name || 'ספק'}`}
          subtitle="הנה מה שקורה השבוע"
          showBackButton={true}
          backUrl="/"
        />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-nav-safe">
          {/* Profile Completion */}
          <ProfileCompletionCard />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {(statsQuery.data ?? []).map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  פעולות מהירות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-10 sm:h-11 text-xs sm:text-sm min-h-[44px]"
                      onClick={() => navigate(action.path)}
                    >
                      <action.icon className="w-4 h-4 ml-1 sm:ml-2 flex-shrink-0" />
                      <span className="truncate">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mini Chart */}
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  צפיות בפרופיל השבוע
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="h-24 sm:h-32 flex items-end justify-between gap-1 sm:gap-2">
                  {(profileViewsQuery.data ?? []).map((height, index) => (
                    <div
                      key={index}
                      className="bg-primary/20 hover:bg-primary/30 transition-colors flex-1 rounded-t min-w-[20px]"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${height}% מהמקסימום`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-2">
                  <span>א'</span>
                  <span>ב'</span>
                  <span>ג'</span>
                  <span>ד'</span>
                  <span>ה'</span>
                  <span>ו'</span>
                  <span>ש'</span>
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  דורש תשומת לב
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-2 sm:space-y-3">
                {(needsAttentionQuery.data ?? []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2">
                    <span className="text-xs sm:text-sm truncate flex-1">{item.title}</span>
                    <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                      item.urgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    }`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivityFeed />

          {/* Suggestions */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">המלצות לשיפור</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="space-y-2">
                {(suggestionsQuery.data ?? []).map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    <span className="text-xs sm:text-sm text-accent-foreground">{suggestion}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="mt-3 sm:mt-4 w-full sm:w-auto min-h-[44px]"
                onClick={() => showToast.comingSoon("המלצות מתקדמות")}
              >
                צפה בכל ההמלצות
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageBoundary>
  );
}