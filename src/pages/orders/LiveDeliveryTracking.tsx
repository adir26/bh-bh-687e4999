import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone, FileText, Clock, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LiveDeliveryTracking: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [eta, setEta] = useState({ minutes: 12, seconds: 30 });

  // Mock order data
  const order = {
    id: 'ORD-001',
    invoiceNumber: '12A394',
    serviceName: 'עיצוב והתקנת מטבח',
    supplierName: 'מטבחי פרימיום',
    driverName: 'דוד כהן',
    driverPhone: '050-1234567',
    vehicleNumber: 'משאית 123-45-678'
  };

  // Simulate countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${orderId}/status`)}
            className="p-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right">
            <h1 className="text-lg font-bold">מעקב משלוח</h1>
            <p className="text-sm text-muted-foreground">חשבונית: #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-gray-100">
        {/* Mock map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
          {/* Map placeholder with route visualization */}
          <div className="absolute inset-4 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="w-full h-full relative bg-gray-50">
              {/* Mock map elements */}
              <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-500 rounded-full animate-pulse">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>
              
              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 80 60 Q 120 80 160 120 T 240 180"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
              
              {/* Destination marker */}
              <div className="absolute bottom-1/4 left-1/3">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              
              {/* Delivery truck icon */}
              <div className="absolute top-1/3 right-1/3">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              
              {/* Distance indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-full px-2 py-1 shadow-sm border">
                  <span className="text-xs font-medium text-blue-600">1 ק"מ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* ETA Card */}
          <Card className="mb-4 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">מעקב הזמנה</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">חשבונית: #{order.invoiceNumber}</p>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">יגיע בעוד</p>
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(eta.minutes, eta.seconds)} דקות
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 ml-1" />
                  הודעה
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 ml-1" />
                  התקשר לנהג
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Details Button */}
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => navigate(`/orders/${orderId}/status`)}
          >
            <FileText className="w-4 h-4 ml-2" />
            פרטי הזמנה
          </Button>
        </div>
      </div>
      
      {/* Driver Info (Sticky at bottom) */}
      <div className="bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="font-medium">{order.driverName}</p>
            <p className="text-sm text-muted-foreground">{order.vehicleNumber}</p>
          </div>
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryTracking;