
import React, { useState, useEffect } from 'react';
import { Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ordersService } from '@/services/supabaseService';
import { toast } from 'sonner';
import OrderCard, { Order } from '@/components/orders/OrderCard';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        const userOrders = await ordersService.getByUserId(user.id);
        
        // Transform database orders to match OrderCard interface
        const transformedOrders: Order[] = userOrders.map(order => ({
          id: order.id,
          invoiceNumber: order.id.substring(0, 8),
          supplierName: 'ספק', // We'll need to join with companies table later
          serviceName: order.title,
          status: order.status === 'pending' ? 'order_received' : 
                 order.status === 'confirmed' ? 'in_production' :
                 order.status === 'in_progress' ? 'in_production' :
                 order.status === 'completed' ? 'delivered' : 'order_received',
          orderDate: new Date(order.created_at).toISOString().split('T')[0],
          estimatedCompletion: order.due_date || undefined,
          completionDate: order.completed_at ? new Date(order.completed_at).toISOString().split('T')[0] : undefined,
          totalAmount: Number(order.amount),
          image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop',
          progress: order.status === 'pending' ? 10 : 
                   order.status === 'confirmed' ? 30 :
                   order.status === 'in_progress' ? 60 : 100
        }));
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error('שגיאה בטעינת ההזמנות');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);


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

  if (loading) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-20 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">טוען הזמנות...</p>
      </div>
    );
  }

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
              <OrderCard key={order.id} order={order} showComplaintButton={true} />
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
