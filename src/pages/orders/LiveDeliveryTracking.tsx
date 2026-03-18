import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MessageCircle, Phone, FileText, Clock, MapPin, Package, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const LiveDeliveryTracking: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [eta, setEta] = useState({ minutes: 0, seconds: 0 });

  const { data: order, isLoading } = useQuery({
    queryKey: ['delivery-tracking', orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, title, status, supplier_id, due_date')
        .eq('id', orderId!)
        .single();

      if (error) throw error;

      const { data: company } = await supabase
        .from('companies')
        .select('name, phone')
        .eq('owner_id', data.supplier_id)
        .maybeSingle();

      return {
        id: data.id,
        title: data.title || 'הזמנה',
        supplierName: company?.name || 'ספק',
        supplierPhone: company?.phone || '',
        status: data.status,
        dueDate: data.due_date,
      };
    },
    staleTime: 30_000,
  });

  // Countdown based on due date
  useEffect(() => {
    if (!order?.dueDate) {
      setEta({ minutes: 0, seconds: 0 });
      return;
    }

    const updateEta = () => {
      const diff = new Date(order.dueDate).getTime() - Date.now();
      if (diff <= 0) {
        setEta({ minutes: 0, seconds: 0 });
        return;
      }
      const totalMins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setEta({ minutes: totalMins, seconds: secs });
    };

    updateEta();
    const interval = setInterval(updateEta, 1000);
    return () => clearInterval(interval);
  }, [order?.dueDate]);

  const formatTime = (minutes: number, seconds: number) => {
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}:${mins.toString().padStart(2, '0')} שעות`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto min-h-screen flex-col bg-background p-6 space-y-4" dir="rtl">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto min-h-screen flex-col items-center justify-center bg-background" dir="rtl">
        <p className="text-muted-foreground">ההזמנה לא נמצאה</p>
        <Button variant="outline" onClick={() => navigate('/orders')} className="mt-4">חזור להזמנות</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto min-h-screen flex-col bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card px-6 py-4 shadow-sm relative z-10 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${orderId}/status`)}
            className="p-2 rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold text-foreground">מעקב בזמן אמת</h1>
            <p className="text-muted-foreground text-sm">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-muted">
        <div className="absolute inset-0 bg-muted/50">
          <div className="w-full h-full relative overflow-hidden">
            {/* Street grid pattern */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-0 w-full h-1 bg-border"></div>
              <div className="absolute top-2/4 left-0 w-full h-1.5 bg-border"></div>
              <div className="absolute top-3/4 left-0 w-full h-1 bg-border"></div>
              <div className="absolute left-1/4 top-0 w-1 h-full bg-border"></div>
              <div className="absolute left-2/4 top-0 w-1.5 h-full bg-border"></div>
              <div className="absolute left-3/4 top-0 w-1 h-full bg-border"></div>
              
              <div className="absolute top-[10%] left-[10%] w-[15%] h-[15%] bg-card rounded-sm"></div>
              <div className="absolute top-[30%] left-[60%] w-[20%] h-[20%] bg-card rounded-sm"></div>
              <div className="absolute top-[60%] left-[20%] w-[25%] h-[15%] bg-card rounded-sm"></div>
            </div>
            
            {/* Route path */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 60 320 L 120 320 L 120 240 L 200 240 L 200 160 L 280 160 L 280 80"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                opacity="0.7"
              />
            </svg>
            
            {/* Delivery truck */}
            <div className="absolute" style={{ top: '45%', left: '35%' }}>
              <div className="relative">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -inset-2 bg-primary rounded-full opacity-30 animate-ping"></div>
              </div>
            </div>
            
            {/* Destination marker */}
            <div className="absolute" style={{ top: '15%', left: '70%' }}>
              <MapPin className="w-8 h-8 text-destructive drop-shadow-lg" />
            </div>
          </div>
        </div>
        
        {/* ETA Card */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="font-bold text-xl text-foreground">
                  {eta.minutes === 0 && eta.seconds === 0 ? 'הגיע!' : 'יגיע בעוד'}
                </h2>
              </div>
              
              {(eta.minutes > 0 || eta.seconds > 0) && (
                <div className="mb-4">
                  <div className="text-4xl font-black text-primary mb-1">
                    {formatTime(eta.minutes, eta.seconds)}
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {eta.minutes > 60 ? '' : 'דקות'}
                  </p>
                </div>
              )}
              
              <div className="bg-accent/50 rounded-2xl p-3">
                <p className="text-accent-foreground font-medium text-sm">
                  🚚 {order.title} {eta.minutes === 0 ? 'הגיע!' : 'בדרך!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action buttons */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 bg-card/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl font-semibold"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                הודעה
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 bg-card/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl font-semibold"
                onClick={() => {
                  if (order.supplierPhone) {
                    const phone = order.supplierPhone.startsWith('+') ? order.supplierPhone : `+972${order.supplierPhone.replace(/^0/, '')}`;
                    window.location.href = `tel:${phone}`;
                  }
                }}
              >
                <Phone className="w-5 h-5 ml-2" />
                התקשר
              </Button>
            </div>
            
            <Button 
              variant="default" 
              size="lg" 
              className="w-full shadow-xl rounded-2xl font-bold h-14"
              onClick={() => navigate(`/orders/${orderId}/status`)}
            >
              <FileText className="w-5 h-5 ml-2" />
              פרטי הזמנה המלאים
            </Button>
          </div>
        </div>
      </div>
      
      {/* Supplier Info */}
      <div className="bg-card p-6 shadow-lg rounded-t-3xl border-t">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="font-bold text-lg text-foreground">{order.supplierName}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">בדרך אליכם</span>
            </div>
          </div>
          {order.supplierPhone && (
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-2xl border-2"
              onClick={() => {
                const phone = order.supplierPhone.startsWith('+') ? order.supplierPhone : `+972${order.supplierPhone.replace(/^0/, '')}`;
                window.location.href = `tel:${phone}`;
              }}
            >
              <Phone className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDeliveryTracking;
