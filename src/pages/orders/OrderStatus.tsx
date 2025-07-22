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
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-lg border-b border-blue-100/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2 rounded-full hover:bg-blue-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">מעקב הזמנה</h1>
            <p className="text-blue-600 font-medium">חשבונית: #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-6">
        <Card className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 ring-1 ring-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={order.image}
                  alt={order.serviceName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-2 ring-blue-100"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{order.serviceName}</h3>
                <p className="text-blue-600 font-semibold">{order.supplierName}</p>
                <p className="text-sm text-gray-500 mt-1">הוזמן ב-{new Date(order.orderDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 pb-6 relative">
        {/* Main Timeline Spine */}
        <div className="absolute right-10 top-0 bottom-20 w-1 bg-gradient-to-b from-blue-200 via-blue-300 to-gray-200 rounded-full shadow-sm" />
        
        <div className="relative max-w-full space-y-8">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === orderSteps.length - 1;
            const isAlternating = index % 2 === 1;
            
            return (
              <div key={step.id} className={`relative ${isAlternating ? 'pl-2' : ''}`}>
                {/* Timeline Dot */}
                <div className={`absolute right-8 w-6 h-6 rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-lg transition-all duration-500 ${
                  step.completed 
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse' 
                    : step.current 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 animate-bounce' 
                    : 'bg-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : step.current ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  )}
                </div>

                {/* Step Number Badge */}
                <div className={`absolute right-14 top-0 w-8 h-6 flex items-center justify-center text-xs font-bold rounded-full transition-all duration-300 ${
                  step.completed || step.current 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                
                {/* Step Content Card */}
                <div className="mr-20">
                  <Card className={`rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
                    step.current 
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-2xl ring-1 ring-blue-300/50' 
                      : step.completed 
                      ? 'bg-white border border-emerald-100 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-50/70 border border-gray-200 shadow-sm'
                  } ${isAlternating ? 'transform -rotate-1 hover:rotate-0' : ''}`}>
                    <CardContent className="p-6 relative">
                      {/* Current Step Glow Effect */}
                      {step.current && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent rounded-3xl pointer-events-none" />
                      )}
                      
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                        step.completed 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                          : step.current 
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      {/* Step Title */}
                      <div className="text-right mb-4">
                        <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          step.completed || step.current ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Emotional Message Box */}
                      {(step.completed || step.current) && step.emotionalMessage && (
                        <div className="bg-gradient-to-l from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50 rounded-2xl p-4 mb-4 shadow-inner">
                          <p className="text-sm text-amber-800 font-medium text-right leading-relaxed">
                            💭 {step.emotionalMessage}
                          </p>
                        </div>
                      )}
                      
                      {/* Premium Progress Section for Current Step */}
                      {step.current && step.progress && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-4 border border-blue-200/50 shadow-inner">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-left">
                              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {step.progress}%
                              </span>
                              <p className="text-xs text-blue-600 font-semibold">הושלם</p>
                              <p className="text-xs text-blue-500 animate-pulse">כמעט מוכן! ✨</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-800">התקדמות הפרויקט</span>
                              {step.estimatedDays && (
                                <p className="text-xs text-gray-600">עוד כ-{step.estimatedDays} ימים</p>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
                              <div
                                className="h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500 shadow-sm animate-pulse"
                                style={{ width: `${step.progress}%` }}
                              />
                            </div>
                            <div className="absolute top-0 left-0 w-full h-3 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                          </div>
                        </div>
                      )}

                      {/* Design Preview Thumbnail */}
                      {step.id === 'in_design' && step.completed && (
                        <div className="mb-4">
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md">
                            <img 
                              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" 
                              alt="תכנית המטבח"
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-2 py-1">
                              <span className="text-xs font-semibold text-gray-800">תכנית מוכנה</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      {step.timestamp && (
                        <div className="flex items-center justify-end gap-2 mb-4 opacity-70">
                          <span className="text-xs text-gray-600 font-medium">{step.timestamp}</span>
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      )}
                      
                      {/* CTA Buttons */}
                      {step.ctaText && (step.completed || step.current) && (
                        <div className="flex gap-3 justify-end mt-4">
                          {step.hasAttachment && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-2xl font-medium border-blue-200 hover:bg-blue-50 text-blue-700 transition-all duration-300 hover:scale-105"
                            >
                              <FileText className="w-4 h-4 ml-1" />
                              {step.attachmentText}
                            </Button>
                          )}
                          
                          <Button 
                            onClick={() => handleCtaClick(step.ctaAction, step)}
                            size="sm"
                            className={`rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${
                              step.current 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200' 
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-200'
                            }`}
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