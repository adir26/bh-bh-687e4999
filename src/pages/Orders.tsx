
import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');

  const orders = [
    {
      id: 'ORD-001',
      supplierName: 'מטבחי פרימיום',
      serviceName: 'עיצוב והתקנת מטבח',
      status: 'in_progress',
      orderDate: '2024-01-15',
      estimatedCompletion: '2024-02-15',
      totalAmount: 45000,
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop',
      progress: 65
    },
    {
      id: 'ORD-002',
      supplierName: 'מיזוג הצפון',
      serviceName: 'התקנת מיזוג אוויר',
      status: 'completed',
      orderDate: '2024-01-10',
      completionDate: '2024-01-12',
      totalAmount: 2500,
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=300&h=200&fit=crop',
      rating: 5
    },
    {
      id: 'ORD-003',
      supplierName: 'שיפוצי יהודה',
      serviceName: 'שיפוץ חדר אמבטיה',
      status: 'pending',
      orderDate: '2024-01-20',
      estimatedStart: '2024-01-25',
      totalAmount: 15000,
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&h=200&fit=crop'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין לאישור';
      case 'in_progress':
        return 'בביצוע';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return 'לא ידוע';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.status === 'pending' || order.status === 'in_progress';
    }
    return order.status === 'completed' || order.status === 'cancelled';
  });

  const tabs = [
    { id: 'active', label: 'פעילות', count: orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length },
    { id: 'history', label: 'היסטוריה', count: orders.filter(o => o.status === 'completed' || o.status === 'cancelled').length }
  ];

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-right">ההזמנות שלי</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 p-4">
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-right flex-1">
                      <CardTitle className="text-base">{order.serviceName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{order.supplierName}</p>
                      <p className="text-xs text-gray-500 mt-1">הזמנה #{order.id}</p>
                    </div>
                    <img
                      src={order.image}
                      alt={order.serviceName}
                      className="w-16 h-16 rounded-lg object-cover ml-3"
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <span className="font-bold text-primary">₪{order.totalAmount.toLocaleString()}</span>
                  </div>

                  {/* Progress Bar for In Progress Orders */}
                  {order.status === 'in_progress' && order.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">התקדמות</span>
                        <span className="text-xs font-medium">{order.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>תאריך הזמנה:</span>
                      <span>{new Date(order.orderDate).toLocaleDateString('he-IL')}</span>
                    </div>
                    {order.estimatedCompletion && (
                      <div className="flex justify-between">
                        <span>זמן משוער לסיום:</span>
                        <span>{new Date(order.estimatedCompletion).toLocaleDateString('he-IL')}</span>
                      </div>
                    )}
                    {order.completionDate && (
                      <div className="flex justify-between">
                        <span>תאריך סיום:</span>
                        <span>{new Date(order.completionDate).toLocaleDateString('he-IL')}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating for Completed Orders */}
                  {order.status === 'completed' && order.rating && (
                    <div className="flex items-center gap-1 mb-3 justify-end">
                      <span className="text-sm">הדירוג שלך:</span>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < order.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 ml-1" />
                      צ'אט
                    </Button>
                    {order.status === 'completed' && !order.rating && (
                      <Button size="sm" className="flex-1">
                        <Star className="w-4 h-4 ml-1" />
                        דרג
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button variant="destructive" size="sm" className="flex-1">
                        בטל
                      </Button>
                    )}
                    {order.status === 'in_progress' && (
                      <Button size="sm" className="flex-1">
                        עוד פרטים
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">אין הזמנות</h3>
            <p className="text-gray-500">
              {activeTab === 'active' ? 'אין לך הזמנות פעילות כרגע' : 'אין לך הזמנות קודמות'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
