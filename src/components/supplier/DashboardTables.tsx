import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  ExternalLink, 
  MessageCircle, 
  Star,
  Clock,
  Mail,
  Phone
} from 'lucide-react';
import { 
  RecentLead, 
  RecentOrder, 
  RecentReview,
  formatCurrency 
} from '@/hooks/useSupplierDashboard';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface DashboardTablesProps {
  leads?: RecentLead[];
  orders?: RecentOrder[];
  reviews?: RecentReview[];
  leadsLoading: boolean;
  ordersLoading: boolean;
  reviewsLoading: boolean;
  leadsError?: Error | null;
  ordersError?: Error | null;
  reviewsError?: Error | null;
}

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 space-x-reverse">
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

const getStatusBadge = (status: string, type: 'lead' | 'order') => {
  type StatusConfig = {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    color: string;
  };

  const statusConfig: Record<'lead' | 'order', Record<string, StatusConfig>> = {
    lead: {
      'new': { label: 'חדש', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'contacted': { label: 'נוצר קשר', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'proposal_sent': { label: 'הצעה נשלחה', variant: 'outline', color: 'bg-purple-100 text-purple-800' },
      'won': { label: 'זכייה', variant: 'default', color: 'bg-green-100 text-green-800' },
      'lost': { label: 'אבדן', variant: 'destructive', color: 'bg-red-100 text-red-800' },
    },
    order: {
      'pending': { label: 'ממתין', variant: 'outline', color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'מאושר', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'in_progress': { label: 'בביצוע', variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'completed': { label: 'הושלם', variant: 'default', color: 'bg-green-100 text-green-800' },
      'canceled': { label: 'בוטל', variant: 'destructive', color: 'bg-red-100 text-red-800' },
    }
  };

  const config = statusConfig[type]?.[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} border-0`}
    >
      {config.label}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  type PriorityConfig = {
    label: string;
    color: string;
  };

  const priorityConfig: Record<string, PriorityConfig> = {
    'low': { label: 'נמוך', color: 'bg-gray-100 text-gray-800' },
    'medium': { label: 'בינוני', color: 'bg-blue-100 text-blue-800' },
    'high': { label: 'גבוה', color: 'bg-orange-100 text-orange-800' },
    'vip': { label: 'VIP', color: 'bg-red-100 text-red-800' },
    'urgent': { label: 'דחוף', color: 'bg-red-100 text-red-800' },
  };

  const config = priorityConfig[priority];
  if (!config) return <Badge variant="outline">{priority}</Badge>;

  return (
    <Badge className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

const getSourceLabel = (sourceKey: string | null | undefined) => {
  const sourceLabels: Record<string, string> = {
    'website': 'אתר',
    'referral': 'הפניה',
    'social_media': 'רשתות חברתיות',
    'advertising': 'פרסום',
    'direct': 'ישיר',
    'other': 'אחר',
    'facebook_paid': 'פייסבוק ממומן',
    'facebook_organic': 'פייסבוק אורגני',
    'word_of_mouth': 'פה לאוזן',
    'whatsapp': 'וואטסאפ',
  };
  
  return sourceLabels[sourceKey || 'other'] || sourceKey || 'אתר';
};

export const DashboardTables: React.FC<DashboardTablesProps> = ({
  leads,
  orders,
  reviews,
  leadsLoading,
  ordersLoading,
  reviewsLoading,
  leadsError,
  ordersError,
  reviewsError,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Recent Leads */}
      <Card className="mobile-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold" dir="rtl">לידים אחרונים</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/supplier/lead-management')}
          >
            צפה בכל
            <ExternalLink className="h-4 w-4 mr-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <TableSkeleton />
          ) : leadsError ? (
            <div className="text-center text-red-600 py-4">
              שגיאה בטעינת לידים: {leadsError.message}
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              אין לידים אחרונים
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div 
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/supplier/lead-management/${lead.id}`)}
                  dir="rtl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {lead.name || lead.contact_email}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {getSourceLabel(lead.source_key)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lead.sla_risk && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {getStatusBadge(lead.status, 'lead')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {lead.contact_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-32">{lead.contact_email}</span>
                        </div>
                      )}
                      {lead.priority_key && getPriorityBadge(lead.priority_key)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(lead.created_at), 'dd/MM', { locale: he })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="mobile-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold" dir="rtl">הזמנות אחרונות</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/supplier/order-management')}
          >
            צפה בכל
            <ExternalLink className="h-4 w-4 mr-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <TableSkeleton />
          ) : ordersError ? (
            <div className="text-center text-red-600 py-4">
              שגיאה בטעינת הזמנות: {ordersError.message}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              אין הזמנות אחרונות
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/supplier/order-management/${order.id}`)}
                  dir="rtl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {order.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {order.client_name || 'לקוח'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.unread_messages > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">
                            {order.unread_messages}
                          </span>
                        </div>
                      )}
                      {getStatusBadge(order.status, 'order')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">
                      {formatCurrency(order.amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(order.created_at), 'dd/MM', { locale: he })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="mobile-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold" dir="rtl">ביקורות אחרונות</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/supplier-reviews')}
          >
            צפה בכל
            <ExternalLink className="h-4 w-4 mr-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <TableSkeleton />
          ) : reviewsError ? (
            <div className="text-center text-red-600 py-4">
              שגיאה בטעינת ביקורות: {reviewsError.message}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              אין ביקורות אחרונות
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  dir="rtl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {review.title || 'ביקורת'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {review.reviewer_name || 'לקוח'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{review.rating}</span>
                    </div>
                  </div>
                  
                  {review.content && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {review.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(review.created_at), 'dd/MM', { locale: he })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};