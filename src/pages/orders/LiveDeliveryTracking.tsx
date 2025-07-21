import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone, FileText, Clock, MapPin, Package, Navigation } from 'lucide-react';
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
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${orderId}/status`)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold text-gray-900">מעקב בזמן אמת</h1>
            <p className="text-gray-600">חשבונית: #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-blue-50">
        {/* Enhanced mock map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
          {/* Map placeholder with enhanced route visualization */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm">
            <div className="w-full h-full relative overflow-hidden">
              {/* Map grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              
              {/* Delivery truck with animation */}
              <div className="absolute top-1/4 right-1/4 transform animate-pulse">
                <div className="relative">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-indigo-400 rounded-full opacity-30 animate-ping"></div>
                </div>
              </div>
              
              {/* Route line with animation */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#3b82f6', stopOpacity:0.7}} />
                  </linearGradient>
                </defs>
                <path
                  d="M 80 60 Q 120 80 160 120 T 240 180 Q 280 200 320 240"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                  strokeDasharray="8,4"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
              
              {/* Destination marker with glow */}
              <div className="absolute bottom-1/4 left-1/3 transform">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
                  <div className="absolute -inset-1 bg-red-400 rounded-full opacity-20 animate-ping"></div>
                </div>
              </div>
              
              {/* Distance indicator with enhanced styling */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-700">1.2 ק"מ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ETA Card - floating at top */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="font-bold text-xl text-gray-900">יגיע בעוד</h2>
              </div>
              
              <div className="mb-4">
                <div className="text-4xl font-black text-indigo-600 mb-1">
                  {formatTime(eta.minutes, eta.seconds)}
                </div>
                <p className="text-gray-600 font-medium">דקות</p>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-3 mb-4">
                <p className="text-indigo-800 font-medium text-sm">
                  🚚 {order.serviceName} כמעט הגיע!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action buttons - floating at bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="space-y-3">
            {/* Quick actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl font-semibold"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                הודעה
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl font-semibold"
              >
                <Phone className="w-5 h-5 ml-2" />
                התקשר
              </Button>
            </div>
            
            {/* Order Details Button */}
            <Button 
              variant="default" 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-xl rounded-2xl font-bold h-14"
              onClick={() => navigate(`/orders/${orderId}/status`)}
            >
              <FileText className="w-5 h-5 ml-2" />
              פרטי הזמנה המלאים
            </Button>
          </div>
        </div>
      </div>
      
      {/* Driver Info Card - Enhanced */}
      <div className="bg-white p-6 shadow-lg rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">{order.driverName}</p>
            <p className="text-gray-600 font-medium">{order.vehicleNumber}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">בדרך אליכם</span>
            </div>
          </div>
          <Button size="lg" variant="outline" className="rounded-2xl border-2">
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryTracking;