
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      type: 'order',
      title: 'עדכון הזמנה',
      message: 'ההזמנה שלך #12345 נשלחה ותגיע מחר',
      time: '5 דקות',
      read: false,
      icon: BellRing
    },
    {
      id: '2',
      type: 'promotion',
      title: 'מבצע מיוחד',
      message: 'הנחה של 20% על כל המטבחים החודש',
      time: '2 שעות',
      read: false,
      icon: Bell
    },
    {
      id: '3',
      type: 'message',
      title: 'הודעה חדשה',
      message: 'קיבלת הודעה מספק המטבחים "דלתא עיצובים"',
      time: '1 יום',
      read: true,
      icon: MessageCircle
    },
    {
      id: '4',
      type: 'reminder',
      title: 'תזכורת',
      message: 'זכור לסיים את תהליך הרישום שלך',
      time: '2 ימים',
      read: true,
      icon: Clock
    }
  ];

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    // Handle notification click based on type
    if (notification.type === 'order') {
      navigate('/orders');
    } else if (notification.type === 'message') {
      navigate('/orders'); // or messages page
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
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">אין התראות חדשות</h2>
            <p className="text-muted-foreground">כל ההתראות שלך יופיעו כאן</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'border-primary/20 bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      !notification.read ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        !notification.read ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
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
