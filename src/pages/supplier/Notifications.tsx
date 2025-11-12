import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowLeft, Bell, Users, MessageSquare, Truck, Star, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export default function SupplierNotifications() {
  const navigate = useNavigate();
  
  const { 
    data: notifications = [], 
    isLoading,
    error 
  } = useNotifications();
  
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_new': return Users;
      case 'lead_status_change': return Users;
      case 'message_new': return MessageSquare;
      case 'delivery': return Truck;
      case 'order_status_change': return CheckCircle;
      case 'order_new': return CheckCircle;
      case 'review_new': return Star;
      case 'quote_accepted': return FileText;
      case 'quote_rejected': return FileText;
      case 'quote_new': return FileText;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'lead_new':
      case 'lead_status_change': 
        return 'text-blue-600 bg-blue-50';
      case 'message_new': 
        return 'text-purple-600 bg-purple-50';
      case 'delivery': 
        return 'text-orange-600 bg-orange-50';
      case 'order_status_change':
      case 'order_new': 
        return 'text-green-600 bg-green-50';
      case 'review_new': 
        return 'text-yellow-600 bg-yellow-50';
      case 'quote_accepted':
      case 'quote_rejected':
      case 'quote_new': 
        return 'text-indigo-600 bg-indigo-50';
      default: 
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type and payload
    const payload = notification.payload || {};
    
    if (payload.lead_id || notification.type === 'lead_new' || notification.type === 'lead_status_change') {
      navigate('/supplier/crm');
    } else if (payload.quote_id || notification.type === 'quote_accepted' || notification.type === 'quote_rejected' || notification.type === 'quote_new') {
      navigate('/supplier/quotes');
    } else if (payload.order_id || notification.type === 'order_new' || notification.type === 'order_status_change') {
      navigate('/supplier/orders');
    } else if (payload.review_id || notification.type === 'review_new') {
      navigate('/supplier/company-profile');
    } else if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: he 
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const urgentCount = notifications.filter(n => 
    !n.is_read && 
    (n.payload?.priority === 'high' || n.type === 'lead_new')
  ).length;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  התראות
                </h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} התראות חדשות` : 'כל ההתראות נקראו'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? 'מסמן...' : 'סמן הכל כנקרא'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">סה"כ התראות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">לא נקראו</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{urgentCount}</div>
              <div className="text-sm text-muted-foreground">דחופות</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="שגיאה בטעינת התראות"
            description="אירעה שגיאה בעת טעינת ההתראות. נסה שוב מאוחר יותר."
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="אין התראות להצגה"
            description="כל ההתראות שלך יוצגו כאן"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const isUrgent = notification.payload?.priority === 'high' || notification.type === 'lead_new';
              const colorClasses = getNotificationColor(notification.type, isUrgent);
            
              return (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${colorClasses}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                דחוף
                              </Badge>
                            )}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-2 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          <Button variant="ghost" size="sm" className="text-xs">
                            פתח
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}