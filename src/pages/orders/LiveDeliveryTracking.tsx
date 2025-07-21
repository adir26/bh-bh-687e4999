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
      <div className="relative flex-1 bg-gray-100">
        {/* Real-style map background */}
        <div className="absolute inset-0 bg-gray-200">
          {/* Map with street-like pattern */}
          <div className="absolute inset-0 bg-white">
            <div className="w-full h-full relative overflow-hidden">
              {/* Street grid pattern */}
              <div className="absolute inset-0">
                {/* Horizontal streets */}
                <div className="absolute top-1/4 left-0 w-full h-1 bg-gray-300"></div>
                <div className="absolute top-2/4 left-0 w-full h-1.5 bg-gray-400"></div>
                <div className="absolute top-3/4 left-0 w-full h-1 bg-gray-300"></div>
                
                {/* Vertical streets */}
                <div className="absolute left-1/4 top-0 w-1 h-full bg-gray-300"></div>
                <div className="absolute left-2/4 top-0 w-1.5 h-full bg-gray-400"></div>
                <div className="absolute left-3/4 top-0 w-1 h-full bg-gray-300"></div>
                
                {/* Building blocks */}
                <div className="absolute top-[10%] left-[10%] w-[15%] h-[15%] bg-gray-100 rounded-sm"></div>
                <div className="absolute top-[30%] left-[60%] w-[20%] h-[20%] bg-gray-100 rounded-sm"></div>
                <div className="absolute top-[60%] left-[20%] w-[25%] h-[15%] bg-gray-100 rounded-sm"></div>
                <div className="absolute top-[15%] left-[75%] w-[15%] h-[25%] bg-gray-100 rounded-sm"></div>
                <div className="absolute top-[65%] left-[65%] w-[20%] h-[20%] bg-gray-100 rounded-sm"></div>
              </div>
              
              {/* Route path - red like in the reference */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 60 320 L 120 320 L 120 240 L 200 240 L 200 160 L 280 160 L 280 80"
                  stroke="#EF4444"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#glow)"
                  className="drop-shadow-md"
                />
              </svg>
              
              {/* Delivery truck - red like in reference */}
              <div className="absolute" style={{ top: '45%', left: '35%' }}>
                <div className="relative">
                  {/* Red circle background like in reference */}
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    {/* Truck icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Animated pulse */}
                  <div className="absolute -inset-2 bg-red-400 rounded-full opacity-30 animate-ping"></div>
                </div>
              </div>
              
              {/* Destination marker - red pin */}
              <div className="absolute" style={{ top: '15%', left: '70%' }}>
                <div className="relative">
                  <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
                  <div className="absolute -inset-1 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
              
              {/* Start point marker */}
              <div className="absolute" style={{ top: '75%', left: '15%' }}>
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-md"></div>
              </div>
              
              {/* Distance and route info */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold text-gray-800">1.2 ק"מ</span>
                    <span className="text-xs text-gray-500">• 3 דקות</span>
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