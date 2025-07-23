import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Users, MessageSquare, Truck, Star, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'new_lead' | 'new_message' | 'delivery' | 'order' | 'review' | 'quote_response';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  urgent: boolean;
  actionUrl?: string;
}

export default function SupplierNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_lead',
      title: 'ליד חדש התקבל',
      message: 'שרה לוי מעוניינת בעיצוב מטבח. תקציב: עד 50,000 ש"ח',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      urgent: true,
      actionUrl: '/supplier/leads'
    },
    {
      id: '2',
      type: 'new_message',
      title: 'הודעה חדשה מלקוח',
      message: 'דוד כהן שלח הודעה לגבי ההזמנה שלו',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false,
      urgent: false,
      actionUrl: '/supplier/orders'
    },
    {
      id: '3',
      type: 'quote_response',
      title: 'הצעת מחיר אושרה!',
      message: 'מיכל אברהם אישרה את הצעת המחיר בסך 15,000 ש"ח',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: false,
      urgent: true,
      actionUrl: '/supplier/orders'
    },
    {
      id: '4',
      type: 'delivery',
      title: 'תזכורת משלוח',
      message: 'הזמנה #002 מתוכננת למחר לאיסוף',
      timestamp: '2024-01-14T14:20:00Z',
      isRead: true,
      urgent: false,
      actionUrl: '/supplier/orders'
    },
    {
      id: '5',
      type: 'review',
      title: 'ביקורת חדשה התקבלה',
      message: 'קיבלת ביקורת 5 כוכבים מלקוח: "שירות מעולה!"',
      timestamp: '2024-01-13T11:00:00Z',
      isRead: true,
      urgent: false,
    },
    {
      id: '6',
      type: 'order',
      title: 'הזמנה חדשה התקבלה',
      message: 'הזמנה #003 התקבלה בסך 8,500 ש"ח',
      timestamp: '2024-01-12T13:30:00Z',
      isRead: true,
      urgent: false,
      actionUrl: '/supplier/orders'
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_lead': return Users;
      case 'new_message': return MessageSquare;
      case 'delivery': return Truck;
      case 'order': return CheckCircle;
      case 'review': return Star;
      case 'quote_response': return FileText;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'new_lead': return 'text-blue-600 bg-blue-50';
      case 'new_message': return 'text-purple-600 bg-purple-50';
      case 'delivery': return 'text-orange-600 bg-orange-50';
      case 'order': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'quote_response': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `לפני ${hours} שעות`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `לפני ${days} ימים`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.urgent && !n.isRead).length;

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
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                סמן הכל כנקרא
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
        <div className="space-y-3">
          {notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colorClasses = getNotificationColor(notification.type, notification.urgent);
            
            return (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
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
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {notification.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              דחוף
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-2 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.actionUrl && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            פתח
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">אין התראות להצגה</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}