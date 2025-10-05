
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Clock, MessageCircle, Package, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const Notifications = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_new':
      case 'lead_assigned':
        return BellRing;
      case 'quote_accepted':
      case 'quote_viewed':
      case 'quote_new':
        return FileText;
      case 'order_status_change':
      case 'order_new':
        return Package;
      case 'message_new':
        return MessageCircle;
      case 'review_new':
        return Star;
      case 'reminder':
        return Clock;
      default:
        return Bell;
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type and payload
    if (notification.action_url) {
      navigate(notification.action_url);
      return;
    }

    const payload = notification.payload || {};

    switch (notification.type) {
      case 'order_status_change':
      case 'order_new':
        if (payload.order_id) {
          navigate(`/orders/${payload.order_id}`);
        } else {
          navigate('/orders');
        }
        break;
      case 'lead_new':
      case 'lead_assigned':
        if (payload.lead_id) {
          navigate('/supplier/crm');
        }
        break;
      case 'quote_accepted':
      case 'quote_viewed':
      case 'quote_new':
        navigate('/supplier/orders');
        break;
      case 'message_new':
        navigate('/my-messages');
        break;
      case 'review_new':
        navigate('/supplier/profile');
        break;
      default:
        // No navigation for other types
        break;
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <Button
          onClick={handleBackClick}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-center flex-1">התראות</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
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
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">אין התראות חדשות</h2>
            <p className="text-muted-foreground">כל ההתראות שלך יופיעו כאן</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: he 
            });
            
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'border-primary/20 bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      !notification.is_read ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        !notification.is_read ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${
                          !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo}
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
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Notifications;
