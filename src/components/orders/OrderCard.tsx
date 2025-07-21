import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, Star, Palette, Hammer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'in_design':
        return <Palette className="w-5 h-5 text-violet-600" />;
      case 'in_production':
        return <Hammer className="w-5 h-5 text-amber-600" />;
      case 'ready_for_delivery':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'on_the_way':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
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
        return 'בתכנון';
      case 'in_production':
        return 'בייצור';
      case 'ready_for_delivery':
        return 'מוכן למשלוח';
      case 'on_the_way':
        return 'בדרך אליך';
      case 'delivered':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return 'לא ידוע';
    }
  };

  const getEmotionalMessage = (status: string) => {
    switch (status) {
      case 'order_received':
        return 'הספק מתחיל לעבוד!';
      case 'in_design':
        return 'האמן שלך יוצר עבורך משהו מיוחד';
      case 'in_production':
        return 'הביטון שלך מתגשם';
      case 'ready_for_delivery':
        return 'הכול מוכן - מחכים רק לך!';
      case 'on_the_way':
        return 'כמעט הגיע! מתרגשים?';
      case 'delivered':
        return 'מקווים שאתם מרוצים מהתוצאה!';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_received':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'in_design':
        return 'text-violet-700 bg-violet-50 border border-violet-200';
      case 'in_production':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'ready_for_delivery':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'on_the_way':
        return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
      case 'delivered':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
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
    <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-5">
          {/* Header with image and basic info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img
                src={order.image}
                alt={order.serviceName}
                className="w-20 h-20 rounded-xl object-cover shadow-sm"
              />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{order.serviceName}</h3>
              <p className="text-gray-600 font-medium mb-1">{order.supplierName}</p>
              <p className="text-gray-400 text-sm">הזמנה #{order.invoiceNumber}</p>
            </div>
          </div>

          {/* Status and emotional message */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1.5 text-sm font-medium rounded-xl ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            {getEmotionalMessage(order.status) && (
              <p className="text-gray-600 text-sm italic">{getEmotionalMessage(order.status)}</p>
            )}
          </div>

          {/* ETA for orders on the way */}
          {order.status === 'on_the_way' && order.eta && (
            <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-indigo-800">יגיע בעוד</span>
                </div>
                <span className="text-lg font-bold text-indigo-900">{order.eta}</span>
              </div>
            </div>
          )}

          {/* Progress indicator for active orders */}
          {isActiveOrder && order.progress && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">התקדמות הפרויקט</span>
                <span className="text-sm font-bold text-primary">{order.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/80"
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Dates and amount */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="text-gray-500">
              {order.estimatedCompletion && isActiveOrder && (
                <span>יושלם עד: {new Date(order.estimatedCompletion).toLocaleDateString('he-IL')}</span>
              )}
              {order.completionDate && (
                <span>הושלם ב: {new Date(order.completionDate).toLocaleDateString('he-IL')}</span>
              )}
            </div>
            <div className="font-bold text-lg text-gray-900">₪{order.totalAmount.toLocaleString()}</div>
          </div>

          {/* Rating for completed orders */}
          {order.status === 'delivered' && order.rating && (
            <div className="flex items-center gap-2 mb-4 justify-end">
              <span className="text-sm text-gray-600">הדירוג שלך:</span>
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
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full font-semibold rounded-xl h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleTrackOrder}
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            {order.status === 'on_the_way' ? 'מעקב בזמן אמת' : 'עקוב אחרי ההזמנה'}
          </Button>
          
          {order.status === 'delivered' && !order.rating && (
            <Button variant="outline" size="lg" className="w-full mt-3 font-semibold rounded-xl h-12 border-2">
              <Star className="w-5 h-5 ml-2" />
              דרג את השירות
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;