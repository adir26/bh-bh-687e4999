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
      description: 'הזמנתך אושרה ואנחנו מתחילים לעבוד! 🎉',
      emotionalMessage: 'נהדר! הצוות שלנו מתחיל לעבוד על החלום שלך',
      icon: CheckCircle,
      timestamp: '09:10 AM, 15 ינואר 2024',
      completed: true,
      ctaText: 'הורד חשבונית',
      ctaAction: 'download_invoice'
    },
    {
      id: 'in_design',
      title: 'עיצוב ותכנון',
      description: 'המעצבים שלנו יוצרים תכנית מותאמת אישית 🎨',
      emotionalMessage: 'האמן שלך עובד על משהו מדהים - הרעיונות מתגבשים!',
      icon: Palette,
      timestamp: '02:30 PM, 16 ינואר 2024',
      completed: true,
      hasAttachment: true,
      attachmentText: 'צפה בתכנית המטבח',
      ctaText: 'ראה את התכנית',
      ctaAction: 'view_design'
    },
    {
      id: 'in_production',
      title: 'בייצור 🔨',
      description: 'הפרויקט שלך מתגשם - אנחנו בעיצומי העבודה!',
      emotionalMessage: 'זה קורה! המטבח שלך מתהוות במלואו',
      icon: Hammer,
      timestamp: 'החל ב 10:00 AM, 20 ינואר 2024',
      completed: false,
      current: true,
      progress: 65,
      estimatedDays: 12,
      ctaText: 'עדכונים ותמונות',
      ctaAction: 'view_progress'
    },
    {
      id: 'ready_for_delivery',
      title: 'מוכן למשלוח 📦',
      description: 'המטבח מוכן ומחכה! בואו נתאם את המועד המושלם',
      emotionalMessage: 'הרגע הגדול מתקרב - הכל מוכן ומחכה לך!',
      icon: Package,
      timestamp: null,
      completed: false,
      ctaText: 'תאום משלוח',
      ctaAction: 'schedule_delivery'
    },
    {
      id: 'on_the_way',
      title: 'בדרך אליך 🚚',
      description: 'המשלוח יצא ובדרך לביתך - מעקב בזמן אמת זמין',
      emotionalMessage: 'רק עוד קצת! המטבח החדש שלך כמעט הגיע',
      icon: Truck,
      timestamp: null,
      completed: false,
      ctaText: 'מעקב בזמן אמת',
      ctaAction: 'live_tracking'
    },
    {
      id: 'delivered',
      title: 'נמסר בהצלחה ✨',
      description: 'המטבח הותקן והושלם - זמן ליהנות מהתוצאה!',
      emotionalMessage: 'ברכותינו! המטבח החדש שלך מוכן - תהנו!',
      icon: Home,
      timestamp: null,
      completed: false,
      ctaText: 'דרג ושתף',
      ctaAction: 'rate_experience'
    }
  ];

  const getStepIconStyle = (step: any) => {
    if (step.completed) {
      return 'text-white bg-emerald-500 shadow-lg shadow-emerald-200';
    } else if (step.current) {
      return 'text-white bg-blue-500 shadow-lg shadow-blue-200 animate-pulse';
    } else {
      return 'text-gray-400 bg-gray-100';
    }
  };

  const getStepCardStyle = (step: any) => {
    if (step.current) {
      return 'bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 shadow-md';
    } else if (step.completed) {
      return 'bg-white border border-gray-100 shadow-sm';
    } else {
      return 'bg-gray-50/50 border border-gray-100 shadow-sm';
    }
  };

  const getConnectorStyle = (step: any, index: number) => {
    if (index === orderSteps.length - 1) return 'invisible';
    if (step.completed) {
      return 'bg-emerald-500 shadow-sm';
    } else if (step.current) {
      return 'bg-gradient-to-b from-emerald-500 to-blue-300';
    } else {
      return 'bg-gray-200';
    }
  };

  const handleCtaClick = (action: string, step: any) => {
    switch (action) {
      case 'live_tracking':
        navigate(`/orders/${orderId}/tracking`);
        break;
      default:
        console.log(`CTA clicked: ${action}`, step);
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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getStepIconStyle(step)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content Card - Premium Design */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <Card className={`rounded-2xl overflow-hidden transition-all duration-300 ${getStepCardStyle(step)}`}>
                      <CardContent className="p-5">
                        {/* Current step accent */}
                        {step.current && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
                        )}
                        
                        {/* Step Title */}
                        <div className="text-right mb-3">
                          <h3 className={`font-bold text-lg mb-1 ${step.completed || step.current ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.title}
                          </h3>
                          <p className={`text-sm leading-relaxed ${step.completed || step.current ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                        </div>
                        
                        {/* Emotional Message Box */}
                        {(step.completed || step.current) && step.emotionalMessage && (
                          <div className="bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mb-4">
                            <p className="text-sm text-amber-800 font-medium text-right leading-relaxed">
                              💭 {step.emotionalMessage}
                            </p>
                          </div>
                        )}
                        
                        {/* Progress Section for Current Step */}
                        {step.current && step.progress && (
                          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                            <div className="flex justify-between items-center mb-3">
                              <div className="text-left">
                                <span className="text-2xl font-bold text-blue-600">{step.progress}%</span>
                                <p className="text-xs text-blue-600 font-medium">הושלם</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-gray-700">התקדמות הפרויקט</span>
                                {step.estimatedDays && (
                                  <p className="text-xs text-gray-500">עוד כ-{step.estimatedDays} ימים</p>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-blue-400"
                                style={{ width: `${step.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        {step.timestamp && (
                          <div className="flex items-center justify-end gap-2 mb-3">
                            <span className="text-xs text-gray-500 font-medium">{step.timestamp}</span>
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )}
                        
                        {/* CTA Buttons */}
                        {step.ctaText && (step.completed || step.current) && (
                          <div className="flex gap-2 justify-end mt-4">
                            {step.hasAttachment && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl font-medium border-gray-200 hover:bg-gray-50"
                              >
                                <FileText className="w-4 h-4 ml-1" />
                                {step.attachmentText}
                              </Button>
                            )}
                            
                            <Button 
                              onClick={() => handleCtaClick(step.ctaAction, step)}
                              size="sm"
                              className={`rounded-xl font-semibold shadow-sm ${
                                step.current 
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              {step.ctaText}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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