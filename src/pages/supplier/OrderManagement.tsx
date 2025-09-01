import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Package, User, Calendar, MapPin, Phone, Mail, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';

type OrderStatus = 'received' | 'production' | 'ready' | 'shipping' | 'delivered';

interface Order {
  id: string;
  client_id: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  due_date: string;
}

const orderStatuses = [
  { key: 'received', label: 'הזמנה התקבלה', icon: AlertCircle, color: 'bg-orange-100 text-orange-800' },
  { key: 'production', label: 'בייצור', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { key: 'ready', label: 'מוכן למשלוח', icon: Package, color: 'bg-purple-100 text-purple-800' },
  { key: 'shipping', label: 'במשלוח', icon: Truck, color: 'bg-yellow-100 text-yellow-800' },
  { key: 'delivered', label: 'נמסר', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
];

function OrderManagementContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['supplier-orders', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_client_id_fkey (
            full_name,
            email
          )
        `)
        .eq('supplier_id', user!.id);

      if (error) throw error;

      const formattedOrders = ordersData?.map(order => ({
        id: order.id,
        client_id: order.client_id,
        clientName: order.profiles?.full_name || 'לקוח ללא שם',
        clientEmail: order.profiles?.email || '',
        title: order.title,
        description: order.description,
        amount: order.amount,
        status: order.current_status || order.status || 'pending',
        created_at: order.created_at,
        due_date: order.due_date
      })) || [];

      return formattedOrders;
    },
    retry: 1,
    staleTime: 30_000,
  });

  const handleCall = (phone: string) => {
    if (!phone) {
      showToast.error('מספר טלפון לא זמין');
      return;
    }
    
    // Format phone number for tel: link
    const formattedPhone = phone.startsWith('+') ? phone : `+972${phone.replace(/^0/, '')}`;
    window.location.href = `tel:${formattedPhone}`;
  };

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.key === status) || orderStatuses[0];
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ current_status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      return { orderId, newStatus };
    },
    onSuccess: ({ newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      const statusInfo = getStatusInfo(newStatus);
      showToast.success(`ההזמנה עודכנה ל: ${statusInfo.label}`);
    },
    onError: (error: any) => {
      showToast.error('שגיאה בעדכון ההזמנה');
    }
  });

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const getStatusStepIndex = (status: string) => {
    return orderStatuses.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/supplier/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              חזור לדשבורד
            </Button>
            <h1 className="text-2xl font-bold text-foreground">ניהול הזמנות</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-nav-safe">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {orderStatuses.map((status) => {
            const count = orders.filter(order => order.status === status.key).length;
            const StatusIcon = status.icon;
            return (
              <Card key={status.key}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <StatusIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-xs text-muted-foreground">{status.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>הזמנות</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <EmptyState
                icon={AlertCircle}
                title="שגיאה בטעינת ההזמנות"
                description="אירעה שגיאה בטעינת הנתונים. אנא נסו שוב."
              />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="אין הזמנות"
                description="אין הזמנות להצגה כרגע."
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-lg">הזמנה #{order.id}</div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                       <div className="text-left">
                         <div className="font-bold text-lg">₪{order.amount.toLocaleString('he-IL')}</div>
                         <div className="text-sm text-muted-foreground">
                           {new Date(order.created_at).toLocaleDateString('he-IL')}
                         </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{order.clientName}</span>
                        </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Phone className="w-4 h-4" />
                           <span>לא זמין</span>
                         </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{order.clientEmail}</span>
                        </div>
                      </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-2 text-sm">
                           <div className="font-medium">{order.title}</div>
                         </div>
                         {order.description && (
                           <div className="text-sm text-muted-foreground">
                             {order.description}
                           </div>
                         )}
                       </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            צפה בפרטים
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>פרטי הזמנה #{order.id}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Status Timeline */}
                              <div>
                                <h3 className="font-semibold mb-4">סטטוס הזמנה</h3>
                                <div className="space-y-3">
                                  {orderStatuses.map((status, index) => {
                                    const isCompleted = getStatusStepIndex(selectedOrder.status) >= index;
                                    const isCurrent = selectedOrder.status === status.key;
                                    const StatusIcon = status.icon;
                                    
                                    return (
                                      <div key={status.key} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          isCompleted ? 'bg-primary text-white' : 
                                          isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' :
                                          'bg-muted text-muted-foreground'
                                        }`}>
                                          <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`${isCurrent ? 'font-semibold text-primary' : ''}`}>
                                          {status.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Update Status */}
                              <div>
                                <h3 className="font-semibold mb-2">עדכן סטטוס</h3>
                                <Select 
                                  value={selectedOrder.status} 
                                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {orderStatuses.map((status) => (
                                      <SelectItem key={status.key} value={status.key}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                               {/* Order Details */}
                               <div>
                                 <h3 className="font-semibold mb-3">פרטי הזמנה</h3>
                                 <div className="space-y-3">
                                   <div className="p-3 bg-muted/50 rounded-lg">
                                     <div className="font-medium">{selectedOrder.title}</div>
                                     {selectedOrder.description && (
                                       <div className="text-sm text-muted-foreground mt-1">{selectedOrder.description}</div>
                                     )}
                                   </div>
                                   <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                                     <div className="font-bold">סה"כ</div>
                                     <div className="font-bold text-lg">₪{selectedOrder.amount.toLocaleString('he-IL')}</div>
                                   </div>
                                 </div>
                               </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status.key} value={status.key}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderManagement() {
  return (
    <PageBoundary timeout={10000}>
      <OrderManagementContent />
    </PageBoundary>
  );
}