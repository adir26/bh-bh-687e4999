import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Order {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  serviceName: string;
  status: 'order_received' | 'in_design' | 'in_production' | 'ready_for_delivery' | 'on_the_way' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedCompletion?: string;
  completionDate?: string;
  totalAmount: number;
  image: string;
  progress?: number;
  rating?: number;
  currentStep?: string;
  eta?: string;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_received':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in_design':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'in_production':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready_for_delivery':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'on_the_way':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'order_received':
        return 'הזמנה התקבלה';
      case 'in_design':
        return 'בשלב התכנון';
      case 'in_production':
        return 'בייצור';
      case 'ready_for_delivery':
        return 'מוכן למשלוח';
      case 'on_the_way':
        return 'בדרך אליך';
      case 'delivered':
        return 'נמסר';
      case 'cancelled':
        return 'בוטל';
      default:
        return 'לא ידוע';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_received':
        return 'text-blue-600 bg-blue-50';
      case 'in_design':
        return 'text-purple-600 bg-purple-50';
      case 'in_production':
        return 'text-orange-600 bg-orange-50';
      case 'ready_for_delivery':
        return 'text-green-600 bg-green-50';
      case 'on_the_way':
        return 'text-blue-600 bg-blue-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleTrackOrder = () => {
    if (order.status === 'on_the_way') {
      navigate(`/orders/${order.id}/tracking`);
    } else {
      navigate(`/orders/${order.id}/status`);
    }
  };

  const isActiveOrder = !['delivered', 'cancelled'].includes(order.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-right flex-1">
            <CardTitle className="text-base mb-1">{order.serviceName}</CardTitle>
            <p className="text-sm text-muted-foreground">{order.supplierName}</p>
            <p className="text-xs text-muted-foreground mt-1">הזמנה #{order.invoiceNumber}</p>
          </div>
          <img
            src={order.image}
            alt={order.serviceName}
            className="w-16 h-16 rounded-lg object-cover ml-3"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <span className="font-bold text-primary">₪{order.totalAmount.toLocaleString()}</span>
        </div>

        {/* ETA for orders on the way */}
        {order.status === 'on_the_way' && order.eta && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">זמן הגעה משוער:</span>
              <span className="text-sm font-bold text-blue-900">{order.eta}</span>
            </div>
          </div>
        )}

        {/* Progress indicator for active orders */}
        {isActiveOrder && order.progress && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">התקדמות</span>
              <span className="text-xs font-medium">{order.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${order.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="text-xs text-muted-foreground mb-3 space-y-1">
          <div className="flex justify-between">
            <span>תאריך הזמנה:</span>
            <span>{new Date(order.orderDate).toLocaleDateString('he-IL')}</span>
          </div>
          {order.estimatedCompletion && isActiveOrder && (
            <div className="flex justify-between">
              <span>זמן משוער לסיום:</span>
              <span>{new Date(order.estimatedCompletion).toLocaleDateString('he-IL')}</span>
            </div>
          )}
          {order.completionDate && (
            <div className="flex justify-between">
              <span>תאריך סיום:</span>
              <span>{new Date(order.completionDate).toLocaleDateString('he-IL')}</span>
            </div>
          )}
        </div>

        {/* Rating for completed orders */}
        {order.status === 'delivered' && order.rating && (
          <div className="flex items-center gap-1 mb-3 justify-end">
            <span className="text-sm">הדירוג שלך:</span>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < order.rating!
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleTrackOrder}
          >
            {order.status === 'on_the_way' ? 'מעקב בזמן אמת' : 'מעקב הזמנה'}
          </Button>
          
          {order.status === 'delivered' && !order.rating && (
            <Button variant="outline" size="sm" className="flex-1">
              <Star className="w-4 h-4 ml-1" />
              דרג
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;