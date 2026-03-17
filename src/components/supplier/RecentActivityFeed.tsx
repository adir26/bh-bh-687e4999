import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, ShoppingBag, Star, FileText, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { withTimeout } from '@/lib/withTimeout';

interface ActivityItem {
  id: string;
  type: 'lead' | 'order' | 'review' | 'quote';
  title: string;
  time: string;
  icon: typeof Users;
  color: string;
}

export function RecentActivityFeed() {
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['recent-activity', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const items: ActivityItem[] = [];

      const [leadsRes, ordersRes, reviewsRes] = await withTimeout(
        Promise.all([
          supabase
            .from('leads')
            .select('id, name, created_at')
            .eq('supplier_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('orders')
            .select('id, title, created_at, status')
            .eq('supplier_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('reviews')
            .select('id, rating, created_at')
            .eq('reviewed_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(2),
        ]),
        10_000
      );

      leadsRes.data?.forEach(lead => {
        items.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: `ליד חדש: ${lead.name || 'ללא שם'}`,
          time: lead.created_at,
          icon: Users,
          color: 'text-blue-600',
        });
      });

      ordersRes.data?.forEach(order => {
        items.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `הזמנה: ${order.title || 'ללא כותרת'}`,
          time: order.created_at,
          icon: ShoppingBag,
          color: 'text-green-600',
        });
      });

      reviewsRes.data?.forEach(review => {
        items.push({
          id: `review-${review.id}`,
          type: 'review',
          title: `ביקורת חדשה: ${review.rating}⭐`,
          time: review.created_at,
          icon: Star,
          color: 'text-yellow-600',
        });
      });

      // Sort by time, most recent first
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return items.slice(0, 6);
    },
    staleTime: 2 * 60 * 1000,
  });

  if (activities.length === 0) return null;

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          פעילות אחרונה
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <activity.icon className={`h-4 w-4 flex-shrink-0 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm truncate">{activity.title}</p>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: he })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
