
import React, { useState } from 'react';
import { Package } from 'lucide-react';
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

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4">
        <h1 className="text-xl font-bold text-right">ההזמנות שלי</h1>
      </div>

      {/* Tabs */}
      <div className="bg-background border-b px-4">
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
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">אין הזמנות</h3>
            <p className="text-muted-foreground">
              {activeTab === 'active' ? 'אין לך הזמנות פעילות כרגע' : 'אין לך הזמנות קודמות'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
