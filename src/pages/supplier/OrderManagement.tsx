import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Package, User, Calendar, MapPin, Phone, Mail, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  orderDate: string;
  deliveryAddress: string;
  status: 'received' | 'production' | 'ready' | 'shipping' | 'delivered';
  totalAmount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const orderStatuses = [
  { key: 'received', label: 'הזמנה התקבלה', icon: AlertCircle, color: 'bg-orange-100 text-orange-800' },
  { key: 'production', label: 'בייצור', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { key: 'ready', label: 'מוכן למשלוח', icon: Package, color: 'bg-purple-100 text-purple-800' },
  { key: 'shipping', label: 'במשלוח', icon: Truck, color: 'bg-yellow-100 text-yellow-800' },
  { key: 'delivered', label: 'נמסר', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
];

export default function OrderManagement() {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orders: Order[] = [
    {
      id: '001',
      clientName: 'שרה לוי',
      clientEmail: 'sarah@email.com',
      clientPhone: '050-1234567',
      orderDate: '2024-01-15',
      deliveryAddress: 'רח\' הרצל 45, תל אביב',
      status: 'production',
      totalAmount: 15000,
      items: [
        { name: 'עיצוב מטבח מלא', quantity: 1, price: 12000 },
        { name: 'התקנה', quantity: 1, price: 3000 },
      ]
    },
    {
      id: '002',
      clientName: 'דוד כהן',
      clientEmail: 'david@email.com',
      clientPhone: '052-7654321',
      orderDate: '2024-01-12',
      deliveryAddress: 'רח\' יפו 123, ירושלים',
      status: 'ready',
      totalAmount: 8500,
      items: [
        { name: 'שיפוץ חדר אמבטיה', quantity: 1, price: 8500 },
      ]
    },
    {
      id: '003',
      clientName: 'מיכל אברהם',
      clientEmail: 'michal@email.com',
      clientPhone: '053-9876543',
      orderDate: '2024-01-10',
      deliveryAddress: 'רח\' הנשיא 78, חיפה',
      status: 'shipping',
      totalAmount: 5200,
      items: [
        { name: 'עיצוב סלון', quantity: 1, price: 4500 },
        { name: 'ייעוץ צבעים', quantity: 1, price: 700 },
      ]
    },
  ];

  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.key === status) || orderStatuses[0];
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const statusInfo = getStatusInfo(newStatus);
    showToast.success(`ההזמנה עודכנה ל: ${statusInfo.label}`);
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

      <div className="max-w-7xl mx-auto px-4 py-6">
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
                        <div className="font-bold text-lg">₪{order.totalAmount.toLocaleString('he-IL')}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString('he-IL')}
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
                          <span>{order.clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{order.clientEmail}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
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
                                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
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

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-3">פריטים בהזמנה</h3>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                      <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">כמות: {item.quantity}</div>
                                      </div>
                                      <div className="font-bold">₪{item.price.toLocaleString('he-IL')}</div>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="font-bold">סה"כ</div>
                                    <div className="font-bold text-lg">₪{selectedOrder.totalAmount.toLocaleString('he-IL')}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
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
          </CardContent>
        </Card>

        {orders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">אין הזמנות להצגה</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}