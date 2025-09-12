import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

const SupplierNotifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  
  const { 
    data: notifications = [], 
    isLoading,
    error 
  } = useNotifications(
    filter === 'unread' ? { unread: true } : 
    filter !== 'all' ? { type: filter } : undefined
  );
  
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_new':
        return '👤';
      case 'lead_status_change':
        return '📊';
      case 'quote_viewed':
        return '👁️';
      case 'quote_accepted':
        return '✅';
      case 'quote_rejected':
        return '❌';
      case 'order_status_change':
        return '📦';
      case 'review_new':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'opacity-60' : '';
    
    switch (type) {
      case 'lead_new':
        return `text-blue-600 ${opacity}`;
      case 'quote_accepted':
        return `text-green-600 ${opacity}`;
      case 'quote_rejected':
        return `text-red-600 ${opacity}`;
      case 'order_status_change':
        return `text-purple-600 ${opacity}`;
      default:
        return `text-muted-foreground ${opacity}`;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.payload?.lead_id) {
      navigate('/supplier/crm');
    } else if (notification.payload?.quote_id) {
      navigate('/supplier/quotes');
    } else if (notification.payload?.order_id) {
      navigate('/supplier/orders');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (error) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <Button onClick={handleBackClick} variant="ghost" size="sm" className="p-2">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-center flex-1">התראות</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={Bell}
            title="שגיאה בטעינת התראות"
            description="נסה לרענן את הדף או חזור מאוחר יותר"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <Button onClick={handleBackClick} variant="ghost" size="sm" className="p-2">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-center flex-1">התראות</h1>
        <Button 
          onClick={() => navigate('/supplier/notification-settings')} 
          variant="ghost" 
          size="sm" 
          className="p-2"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </header>

      {/* Summary and filters */}
      <div className="p-4 bg-white border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              `${notifications.length} התראות, ${unreadCount} לא נקראו`
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל ההתראות</SelectItem>
              <SelectItem value="unread">לא נקראו</SelectItem>
              <SelectItem value="lead_new">לידים חדשים</SelectItem>
              <SelectItem value="quote_accepted">הצעות מחיר התקבלו</SelectItem>
              <SelectItem value="order_status_change">עדכוני הזמנות</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              icon={Bell}
              title="אין התראות"
              description="כל ההתראות שלך יופיעו כאן"
            />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'border-primary/20 bg-primary/5' : 'opacity-75'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`text-lg flex-shrink-0 ${getNotificationColor(notification.type, notification.is_read)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${
                          !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: he
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <Badge variant="secondary" className="text-xs">
                            חדש
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SupplierNotifications;