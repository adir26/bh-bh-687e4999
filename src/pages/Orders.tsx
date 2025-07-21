
import React, { useState } from 'react';
import { Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderCard, { Order } from '@/components/orders/OrderCard';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');

  const orders: Order[] = [
    {
      id: 'ORD-001',
      invoiceNumber: '12A394',
      supplierName: 'מטבחי פרימיום',
      serviceName: 'עיצוב והתקנת מטבח',
      status: 'in_production',
      orderDate: '2024-01-15',
      estimatedCompletion: '2024-02-15',
      totalAmount: 45000,
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop',
      progress: 65
    },
    {
      id: 'ORD-002',
      invoiceNumber: '78B456',
      supplierName: 'מיזוג הצפון',
      serviceName: 'התקנת מיזוג אוויר',
      status: 'delivered',
      orderDate: '2024-01-10',
      completionDate: '2024-01-12',
      totalAmount: 2500,
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=300&h=200&fit=crop',
      rating: 5
    },
    {
      id: 'ORD-003',
      invoiceNumber: '34C789',
      supplierName: 'שיפוצי יהודה',
      serviceName: 'שיפוץ חדר אמבטיה',
      status: 'order_received',
      orderDate: '2024-01-20',
      estimatedCompletion: '2024-01-25',
      totalAmount: 15000,
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&h=200&fit=crop',
      progress: 20
    },
    {
      id: 'ORD-004',
      invoiceNumber: '56D012',
      supplierName: 'מובילי הצפון',
      serviceName: 'שירותי הובלה ופינוי',
      status: 'on_the_way',
      orderDate: '2024-01-22',
      totalAmount: 1200,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      eta: '12 דקות'
    }
  ];


  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return !['delivered', 'cancelled'].includes(order.status);
    }
    return ['delivered', 'cancelled'].includes(order.status);
  });

  const activeOrderStatuses = ['order_received', 'in_design', 'in_production', 'ready_for_delivery', 'on_the_way'];
  const historyOrderStatuses = ['delivered', 'cancelled'];

  const tabs = [
    { 
      id: 'active', 
      label: 'פעילות', 
      count: orders.filter(o => activeOrderStatuses.includes(o.status)).length 
    },
    { 
      id: 'history', 
      label: 'היסטוריה', 
      count: orders.filter(o => historyOrderStatuses.includes(o.status)).length 
    }
  ];

  const activeOrdersCount = orders.filter(o => activeOrderStatuses.includes(o.status)).length;

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ההזמנות שלי</h1>
          {activeOrdersCount > 0 && (
            <p className="text-gray-600 text-sm flex items-center justify-end gap-1">
              <Heart className="w-4 h-4 text-red-400" />
              {activeOrdersCount} פרויקטים בעבודה
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex-1 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
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
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">אין הזמנות</h3>
            <p className="text-gray-500 text-lg">
              {activeTab === 'active' ? 'אין לך הזמנות פעילות כרגע' : 'אין לך הזמנות קודמות'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
