import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Package, Truck, Home, Palette, Hammer, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OrderStatus: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Mock order data - in real app, fetch based on orderId
  const order = {
    id: 'ORD-001',
    invoiceNumber: '12A394',
    serviceName: 'עיצוב והתקנת מטבח',
    supplierName: 'מטבחי פרימיום',
    image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop',
    status: 'in_production',
    orderDate: '2024-01-15',
    estimatedCompletion: '2024-02-15'
  };

  const orderSteps = [
    {
      id: 'order_received',
      title: 'הזמנה התקבלה',
      description: 'הזמנתך אושרה על ידי הספק',
      emotionalMessage: 'נהדר! הספק שלך מתחיל לעבוד',
      icon: CheckCircle,
      timestamp: '09:10 AM, 15 ינואר 2024',
      completed: true
    },
    {
      id: 'in_design',
      title: 'שלב התכנון',
      description: 'עבודה על סקיצות ותכנון ראשוני',
      emotionalMessage: 'האמן שלך יוצר עבורך משהו מיוחד ✨',
      icon: Palette,
      timestamp: '02:30 PM, 16 ינואר 2024',
      completed: true,
      hasAttachment: true,
      attachmentText: 'צפה בתכנית המטבח'
    },
    {
      id: 'in_production',
      title: 'בייצור',
      description: 'ייצור או הכנת ההזמנה',
      emotionalMessage: 'החלום שלך מתגשם! הפרויקט מתקדם יפה',
      icon: Hammer,
      timestamp: 'החל ב 10:00 AM, 20 ינואר 2024',
      completed: false,
      current: true,
      progress: 65
    },
    {
      id: 'ready_for_delivery',
      title: 'מוכן למשלוח',
      description: 'ההזמנה מוכנה ומחכה לתיאום',
      emotionalMessage: 'הכול מוכן! מחכים רק לתיאום איתך',
      icon: Package,
      timestamp: null,
      completed: false
    },
    {
      id: 'on_the_way',
      title: 'בדרך אליך',
      description: 'ההזמנה יצאה למשלוח',
      emotionalMessage: 'כמעט הגיע! מתרגשים? 🚚',
      icon: Truck,
      timestamp: null,
      completed: false
    },
    {
      id: 'delivered',
      title: 'נמסר בהצלחה',
      description: 'ההזמנה הושלמה בהצלחה',
      emotionalMessage: 'מקווים שתהנו מהתוצאה המדהימה!',
      icon: Home,
      timestamp: null,
      completed: false
    }
  ];

  const getStepStyle = (step: any) => {
    if (step.completed) {
      return 'text-emerald-600 bg-emerald-100 border-2 border-emerald-200 shadow-sm';
    } else if (step.current) {
      return 'text-primary bg-primary/10 border-2 border-primary/30 shadow-lg animate-pulse';
    } else {
      return 'text-gray-400 bg-gray-50 border-2 border-gray-200';
    }
  };

  const getConnectorStyle = (step: any, index: number) => {
    if (index === orderSteps.length - 1) return 'invisible';
    if (step.completed) {
      return 'bg-gradient-to-b from-emerald-400 to-emerald-300';
    } else if (step.current) {
      return 'bg-gradient-to-b from-emerald-400 via-primary/50 to-gray-200';
    } else {
      return 'bg-gray-200';
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold text-gray-900">מעקב הזמנה</h1>
            <p className="text-gray-600">חשבונית: #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4">
        <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <img
                src={order.image}
                alt={order.serviceName}
                className="w-16 h-16 rounded-xl object-cover shadow-sm"
              />
              <div className="flex-1 text-right">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{order.serviceName}</h3>
                <p className="text-gray-600 font-medium">{order.supplierName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 pb-6">
        <div className="relative max-w-full">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative mb-6 last:mb-0">
                {/* Timeline connector */}
                <div
                  className={`absolute right-6 top-16 w-1 h-20 rounded-full ${getConnectorStyle(step, index)}`}
                />
                
                {/* Step content */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getStepStyle(step)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content - Mobile optimized */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full">
                      <h3 className={`font-bold text-base mb-2 text-right break-words ${step.completed || step.current ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm mb-2 text-right leading-relaxed break-words ${step.completed || step.current ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                      
                      {/* Emotional message */}
                      {(step.completed || step.current) && step.emotionalMessage && (
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-3 mb-3">
                          <p className="text-sm text-primary font-medium text-right break-words">
                            {step.emotionalMessage}
                          </p>
                        </div>
                      )}
                      
                      {step.timestamp && (
                        <div className="flex items-center justify-end gap-1 mb-3 text-right">
                          <span className="text-xs text-gray-500 break-words">{step.timestamp}</span>
                          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        </div>
                      )}
                      
                      {/* Progress bar for current step */}
                      {step.current && step.progress && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-primary">{step.progress}%</span>
                            <span className="text-sm font-medium text-gray-600">התקדמות הפרויקט</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/80"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-xs text-gray-500 font-medium">
                              נותרו עוד {100 - step.progress}% להשלמה
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Attachment button */}
                      {step.hasAttachment && (
                        <div className="text-right mb-2">
                          <Button variant="outline" size="sm" className="rounded-xl font-medium text-sm">
                            <FileText className="w-4 h-4 ml-1 flex-shrink-0" />
                            <span className="break-words">{step.attachmentText}</span>
                          </Button>
                        </div>
                      )}
                      
                      {/* Track button for on_the_way status */}
                      {step.id === 'on_the_way' && step.current && (
                        <div className="text-right">
                          <Button 
                            className="rounded-xl font-semibold shadow-md text-sm"
                            onClick={() => navigate(`/orders/${orderId}/tracking`)}
                          >
                            מעקב בזמן אמת
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 bg-white">
        <div className="pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full rounded-xl font-semibold border-2 h-12"
          >
            <Share2 className="w-5 h-5 ml-2 flex-shrink-0" />
            <span className="break-words">שתף סטטוס עם המשפחה</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;