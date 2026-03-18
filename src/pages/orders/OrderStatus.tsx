import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, Clock, Package, Truck, Home, Palette, Hammer, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const OrderStatus: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-status', orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, title, description, status, amount, created_at, due_date, supplier_id, client_id')
        .eq('id', orderId!)
        .single();

      if (error) throw error;

      // Get supplier company info
      const { data: company } = await supabase
        .from('companies')
        .select('name, logo_url')
        .eq('owner_id', data.supplier_id)
        .maybeSingle();

      return {
        id: data.id,
        title: data.title || 'הזמנה',
        description: data.description || '',
        supplierName: company?.name || 'ספק',
        image: company?.logo_url || '',
        status: data.status || 'received',
        orderDate: data.created_at,
        estimatedCompletion: data.due_date,
        amount: data.amount,
      };
    },
    staleTime: 60_000,
  });

  const statusMap: Record<string, number> = {
    received: 0,
    pending: 0,
    production: 2,
    ready: 3,
    shipping: 4,
    delivered: 5,
    completed: 5,
  };

  const currentStepIndex = statusMap[order?.status || 'received'] ?? 0;

  const orderSteps = [
    {
      id: 'order_received',
      title: 'הזמנה התקבלה',
      description: 'הזמנתך אושרה ואנחנו מתחילים לעבוד! 🎉',
      emotionalMessage: 'נהדר! הצוות שלנו מתחיל לעבוד על החלום שלך',
      icon: CheckCircle,
      ctaText: 'הורד חשבונית',
      ctaAction: 'download_invoice'
    },
    {
      id: 'in_design',
      title: 'עיצוב ותכנון',
      description: 'המעצבים שלנו יוצרים תכנית מותאמת אישית 🎨',
      emotionalMessage: 'האמן שלך עובד על משהו מדהים - הרעיונות מתגבשים!',
      icon: Palette,
      ctaText: 'ראה את התכנית',
      ctaAction: 'view_design'
    },
    {
      id: 'in_production',
      title: 'בייצור 🔨',
      description: 'הפרויקט שלך מתגשם - אנחנו בעיצומי העבודה!',
      emotionalMessage: 'זה קורה! הפרויקט שלך בתהליך',
      icon: Hammer,
      ctaText: 'עדכונים ותמונות',
      ctaAction: 'view_progress'
    },
    {
      id: 'ready_for_delivery',
      title: 'מוכן למשלוח 📦',
      description: 'הכל מוכן ומחכה! בואו נתאם את המועד המושלם',
      emotionalMessage: 'הרגע הגדול מתקרב - הכל מוכן ומחכה לך!',
      icon: Package,
      ctaText: 'תאום משלוח',
      ctaAction: 'schedule_delivery'
    },
    {
      id: 'on_the_way',
      title: 'בדרך אליך 🚚',
      description: 'המשלוח יצא ובדרך לביתך',
      emotionalMessage: 'רק עוד קצת! ההזמנה כמעט הגיעה',
      icon: Truck,
      ctaText: 'מעקב בזמן אמת',
      ctaAction: 'live_tracking'
    },
    {
      id: 'delivered',
      title: 'נמסר בהצלחה ✨',
      description: 'ההזמנה הושלמה - זמן ליהנות מהתוצאה!',
      emotionalMessage: 'ברכותינו! תהנו!',
      icon: Home,
      ctaText: 'דרג ושתף',
      ctaAction: 'rate_experience'
    }
  ];

  const handleCtaClick = (action: string) => {
    switch (action) {
      case 'live_tracking':
        navigate(`/orders/${orderId}/tracking`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto min-h-screen flex-col bg-background p-6 space-y-4" dir="rtl">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
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
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gradient-to-br from-background to-muted/30" dir="rtl">
      {/* Header */}
      <div className="bg-card px-6 py-6 rounded-b-3xl shadow-lg border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2 rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold text-foreground">מעקב הזמנה</h1>
            <p className="text-primary font-medium text-sm">#{order.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-6">
        <Card className="rounded-3xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {order.image ? (
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-2 ring-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 text-right">
                <h3 className="font-bold text-xl text-foreground mb-1">{order.title}</h3>
                <p className="text-primary font-semibold">{order.supplierName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  הוזמן ב-{new Date(order.orderDate).toLocaleDateString('he-IL')}
                </p>
                {order.amount > 0 && (
                  <p className="text-sm font-bold text-foreground mt-1">₪{Number(order.amount).toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 pb-6 relative">
        <div className="absolute right-10 top-0 bottom-20 w-1 bg-gradient-to-b from-primary/30 via-primary/20 to-muted rounded-full" />
        
        <div className="relative max-w-full space-y-8">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute right-8 w-6 h-6 rounded-full flex items-center justify-center z-10 ring-4 ring-background shadow-lg transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                } ${isCurrent ? 'animate-pulse' : ''}`}>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  ) : (
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  )}
                </div>

                {/* Step Number */}
                <div className={`absolute right-14 top-0 w-8 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                  isCompleted || isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                
                {/* Step Content */}
                <div className="mr-20">
                  <Card className={`rounded-3xl overflow-hidden transition-all duration-500 ${
                    isCurrent 
                      ? 'bg-primary/5 border-2 border-primary/30 shadow-2xl' 
                      : isCompleted 
                      ? 'bg-card border shadow-lg' 
                      : 'bg-muted/50 border shadow-sm opacity-60'
                  }`}>
                    <CardContent className="p-6 relative">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'animate-pulse' : ''}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      <div className="text-right mb-4">
                        <h3 className={`font-bold text-xl mb-2 ${
                          isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          isCompleted || isCurrent ? 'text-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Emotional Message */}
                      {(isCompleted || isCurrent) && step.emotionalMessage && (
                        <div className="bg-accent/50 border border-border rounded-2xl p-4 mb-4">
                          <p className="text-sm text-accent-foreground font-medium text-right leading-relaxed">
                            💭 {step.emotionalMessage}
                          </p>
                        </div>
                      )}
                      
                      {/* CTA Buttons */}
                      {step.ctaText && (isCompleted || isCurrent) && (
                        <div className="flex gap-3 justify-end mt-4">
                          <Button 
                            onClick={() => handleCtaClick(step.ctaAction)}
                            size="sm"
                            variant={isCurrent ? 'default' : 'secondary'}
                            className="rounded-2xl font-semibold shadow-lg"
                          >
                            {step.ctaText}
                            <ArrowRight className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 bg-card">
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full rounded-xl font-semibold border-2 h-12"
            onClick={async () => {
              const url = `${window.location.origin}/orders/${orderId}/status`;
              if (navigator.share) {
                await navigator.share({ title: `מעקב הזמנה - ${order.title}`, url });
              } else {
                await navigator.clipboard.writeText(url);
              }
            }}
          >
            <Share2 className="w-5 h-5 ml-2 flex-shrink-0" />
            <span>שתף סטטוס</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
