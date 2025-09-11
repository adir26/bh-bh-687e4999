import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications({ unread: true });
  const { data: unreadCount = 0 } = useNotificationCount();
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

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead.mutate(notification.id);

    // Navigate based on notification type
    if (notification.payload?.lead_id) {
      navigate('/supplier/crm');
    } else if (notification.payload?.quote_id) {
      navigate('/supplier/quotes');
    } else if (notification.payload?.order_id) {
      navigate('/supplier/orders');
    }
  };

  const handleViewAll = () => {
    navigate('/supplier/notifications');
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          aria-label={`התראות ${unreadCount > 0 ? `- ${unreadCount} חדשות` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rtl:text-right">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">התראות</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-auto p-1"
            >
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">אין התראות חדשות</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0"
                onSelect={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 p-3 w-full cursor-pointer hover:bg-muted/50">
                  <div className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight">
                        {notification.title}
                      </p>
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
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleViewAll} className="p-3 text-center">
              <Button variant="ghost" size="sm" className="w-full">
                צפה בכל התראות
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};