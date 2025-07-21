import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Package, Truck, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      icon: CheckCircle,
      timestamp: '09:10 AM, 15 ינואר 2024',
      completed: true
    },
    {
      id: 'in_design',
      title: 'שלב התכנון',
      description: 'עבודה על סקיצות ותכנון ראשוני',
      icon: AlertCircle,
      timestamp: '02:30 PM, 16 ינואר 2024',
      completed: true,
      hasAttachment: true,
      attachmentText: 'צפה בתכנית המטבח'
    },
    {
      id: 'in_production',
      title: 'בייצור',
      description: 'ייצור או הכנת ההזמנה',
      icon: Package,
      timestamp: 'החל ב 10:00 AM, 20 ינואר 2024',
      completed: false,
      current: true,
      progress: 65
    },
    {
      id: 'ready_for_delivery',
      title: 'מוכן למשלוח',
      description: 'ההזמנה מוכנה ומחכה לתיאום',
      icon: Clock,
      timestamp: null,
      completed: false
    },
    {
      id: 'on_the_way',
      title: 'בדרך',
      description: 'ההזמנה יצאה למשלוח',
      icon: Truck,
      timestamp: null,
      completed: false
    },
    {
      id: 'delivered',
      title: 'נמסר',
      description: 'ההזמנה הושלמה בהצלחה',
      icon: Home,
      timestamp: null,
      completed: false
    }
  ];

  const getStepStyle = (step: any) => {
    if (step.completed) {
      return 'text-green-600 bg-green-100';
    } else if (step.current) {
      return 'text-blue-600 bg-blue-100';
    } else {
      return 'text-gray-400 bg-gray-100';
    }
  };

  const getConnectorStyle = (step: any, index: number) => {
    if (index === orderSteps.length - 1) return 'invisible';
    if (step.completed) {
      return 'bg-green-300';
    } else if (step.current) {
      return 'bg-gradient-to-b from-green-300 to-gray-200';
    } else {
      return 'bg-gray-200';
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right">
            <h1 className="text-lg font-bold">סטטוס הזמנה</h1>
            <p className="text-sm text-muted-foreground">חשבונית: #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={order.image}
                alt={order.serviceName}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 text-right">
                <h3 className="font-semibold text-sm">{order.serviceName}</h3>
                <p className="text-xs text-muted-foreground">{order.supplierName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 pb-6">
        <div className="relative">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Timeline connector */}
                <div
                  className={`absolute right-6 top-12 w-0.5 h-16 ${getConnectorStyle(step, index)}`}
                />
                
                {/* Step content */}
                <div className="flex items-start gap-4 pb-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepStyle(step)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-right">
                      <h3 className={`font-semibold ${step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.completed || step.current ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                        {step.description}
                      </p>
                      
                      {step.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {step.timestamp}
                        </p>
                      )}
                      
                      {/* Progress bar for current step */}
                      {step.current && step.progress && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">התקדמות</span>
                            <span className="text-xs font-medium">{step.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Attachment button */}
                      {step.hasAttachment && (
                        <Button variant="outline" size="sm" className="mt-2">
                          {step.attachmentText}
                        </Button>
                      )}
                      
                      {/* Track button for on_the_way status */}
                      {step.id === 'on_the_way' && step.current && (
                        <Button 
                          className="mt-2"
                          onClick={() => navigate(`/orders/${orderId}/tracking`)}
                        >
                          מעקב בזמן אמת
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;