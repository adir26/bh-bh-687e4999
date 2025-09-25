import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Package, Truck, Star, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Order, OrderEvent } from '@/services/orderService';

interface OrderTimelineProps {
  order: Order;
  events: OrderEvent[];
}

const statusConfig = {
  pending: { label: 'הזמנה נרשמה', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'אושרה', icon: CheckCircle, color: 'text-blue-500' },
  in_progress: { label: 'בייצור', icon: Package, color: 'text-purple-500' },
  completed: { label: 'הושלמה', icon: Star, color: 'text-green-500' },
  cancelled: { label: 'בוטלה', icon: AlertCircle, color: 'text-red-500' }
};

const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed'];

export function OrderTimeline({ order, events }: OrderTimelineProps) {
  const getStatusIndex = (status: string) => statusOrder.indexOf(status);
  const currentStatusIndex = getStatusIndex(order.status);

  const getEventIcon = (event: OrderEvent) => {
    switch (event.event_type) {
      case 'payment_status_update':
        return <CreditCard className="h-3 w-3" />;
      case 'payment_link_created':
        return <DollarSign className="h-3 w-3" />;
      case 'status_change':
        return <Package className="h-3 w-3" />;
      case 'message':
        return <div className="h-2 w-2 bg-primary rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-primary rounded-full" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" dir="rtl">
          <Package className="h-5 w-5" />
          ציר זמן ההזמנה
        </CardTitle>
      </CardHeader>
      <CardContent dir="rtl">
        <div className="space-y-6">
          {/* Status Progress */}
          <div className="relative">
            {statusOrder.map((status, index) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const Icon = config.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status} className="flex items-center gap-4 relative">
                  {/* Connector Line */}
                  {index < statusOrder.length - 1 && (
                    <div
                      className={`absolute right-4 top-8 w-0.5 h-12 ${
                        isCompleted && index < currentStatusIndex
                          ? 'bg-primary' 
                          : 'bg-muted'
                      }`}
                    />
                  )}
                  
                  {/* Status Icon */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Status Label */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {config.label}
                      </span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          נוכחי
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show timestamp if status is completed */}
                    {isCompleted && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.updated_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Events */}
          {events.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">פעילות אחרונה</h4>
              <div className="space-y-3">
                {events.slice(-5).reverse().map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                    <div className="mt-2 flex-shrink-0">
                      {getEventIcon(event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {getEventDescription(event)}
                        </p>
                        <time className="text-xs text-muted-foreground">
                          {format(new Date(event.created_at), 'dd/MM HH:mm', { locale: he })}
                        </time>
                      </div>
                      {event.meta && Object.keys(event.meta).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getEventDetails(event)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getEventDescription(event: OrderEvent): string {
  switch (event.event_type) {
    case 'status_change':
      const statusLabels: Record<string, string> = {
        'pending': 'ממתינה',
        'confirmed': 'אושרה',
        'in_progress': 'בייצור',
        'completed': 'הושלמה',
        'cancelled': 'בוטלה'
      };
      return `סטטוס עודכן ל${statusLabels[event.meta.new_status] || event.meta.new_status}`;
    case 'message':
      return event.meta.has_file ? 'שלח קובץ' : 'שלח הודעה';
    case 'file_upload':
      return `העלה קובץ ${event.meta.file_name || ''}`;
    case 'payment_status_update':
      const statusTexts: Record<string, string> = {
        'completed': 'הושלם',
        'failed': 'נכשל',
        'cancelled': 'בוטל',
        'pending': 'ממתין'
      };
      return `תשלום ${statusTexts[event.meta.status] || 'עודכן'}`;
    case 'payment_link_created':
      return 'נוצר קישור תשלום';
    default:
      return event.event_type;
  }
}

function getEventDetails(event: OrderEvent): string {
  switch (event.event_type) {
    case 'status_change':
      return event.meta.note || '';
    case 'file_upload':
      return `${Math.round((event.meta.file_size || 0) / 1024)} KB`;
    case 'payment_status_update':
      const currency = event.meta.currency === 'ILS' ? '₪' : event.meta.currency || 'USD';
      return `${currency}${(event.meta.amount || 0).toLocaleString()}`;
    case 'payment_link_created':
      const linkCurrency = event.meta.currency === 'ILS' ? '₪' : event.meta.currency || 'USD';
      return `${linkCurrency}${(event.meta.amount || 0).toLocaleString()}`;
    default:
      return '';
  }
}