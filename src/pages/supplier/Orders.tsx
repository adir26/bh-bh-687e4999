import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { ArrowLeft, Search, CalendarIcon, Eye, Phone, MessageSquare, FileText, Plus, X } from 'lucide-react';
import { StatusBadge, getActiveStatuses, getClosedStatuses, type OrderStatus } from '@/components/supplier/StatusBadge';
import { PhoneLink } from '@/components/supplier/PhoneLink';
import { Timeline } from '@/components/supplier/Timeline';
import { FileUploader, FileList } from '@/components/supplier/FileUploader';
import { CreateOrderWizard } from '@/components/supplier/CreateOrderWizard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { PageBoundary } from '@/components/system/PageBoundary';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';
import { withTimeout } from '@/lib/withTimeout';

interface Order {
  id: string;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_phone_e164?: string;
  customer_email?: string;
  title: string;
  current_status: OrderStatus;
  total_ils: number;
  eta_at?: string;
  shipping_address?: any;
  created_at: string;
  closed_at?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  description?: string | null;
  line_total: number;
}

interface StatusEvent {
  id: string;
  old_status?: string;
  new_status: string;
  reason?: string;
  note?: string;
  is_customer_visible: boolean;
  changed_by?: string;
  created_at: string;
  user_profile?: {
    full_name: string;
  };
}

interface StatusUpdateDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: () => void;
}

function StatusUpdateDialog({ order, open, onOpenChange, onStatusUpdated }: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.current_status);
      setReason('');
      setIsCustomerVisible(false);
    }
  }, [order]);

  const handleUpdate = async () => {
    if (!order || newStatus === order.current_status) {
      onOpenChange(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('rpc_update_order_status', {
        p_order_id: order.id,
        p_new_status: newStatus,
        p_reason: reason || null,
        p_is_customer_visible: isCustomerVisible
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'שגיאה בעדכון הסטטוס');
      }

      toast.success(result.message);
      onStatusUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'שגיאה בעדכון הסטטוס');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'canceled', 'refunded'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עדכון סטטוס הזמנה</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>הזמנה #{order.order_number || order.id.slice(0, 8)}</Label>
            <p className="text-sm text-muted-foreground">{order.title}</p>
          </div>

          <div>
            <Label>סטטוס חדש</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>סיבה לשינוי (אופציונלי)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="הסבר את הסיבה לשינוי הסטטוס..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="customer-visible"
              checked={isCustomerVisible}
              onCheckedChange={(checked) => setIsCustomerVisible(checked as boolean)}
            />
            <Label htmlFor="customer-visible" className="text-sm">
              הודע ללקוח על השינוי
            </Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating || newStatus === order.current_status}
            >
              {isUpdating ? 'מעדכן...' : 'עדכן סטטוס'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupplierOrders() {
  usePageLoadTimer('SupplierOrders');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([]);
  const [orderAttachments, setOrderAttachments] = useState<any[]>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const itemsPerPage = 20;

  // Fetch orders with React Query
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['supplier-orders', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('orders')
          .select(`
            *,
            client_profile:profiles!orders_client_id_fkey (full_name, email)
          `)
          .eq('supplier_id', user!.id)
          .order('created_at', { ascending: false }),
        12000
      );

      if (error) throw new Error('שגיאה בטעינת ההזמנות');

      return data?.map(order => ({
        ...order,
        customer_name: order.customer_name || order.client_profile?.full_name || 'לקוח ללא שם',
        customer_email: order.customer_email || order.client_profile?.email || '',
        current_status: (order.current_status || order.status) as OrderStatus
      })) || [];
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Set up realtime subscription
  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('supplier-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `supplier_id=eq.${user.id}`
        },
        () => {
          console.log('Order updated, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      setOrderItems(items || []);

      // Fetch status events
      const { data: events, error: eventsError } = await supabase
        .from('order_status_events')
        .select(`
          *,
          user_profile:profiles!order_status_events_changed_by_fkey (full_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setStatusEvents(events || []);

      // Fetch attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('order_attachments')
        .select('*')
        .eq('order_id', orderId);

      if (attachmentsError) throw attachmentsError;
      setOrderAttachments(attachments || []);

    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('שגיאה בטעינת פרטי ההזמנה');
    }
  };

  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by active/past
    if (activeTab === 'active') {
      filtered = filtered.filter(order => getActiveStatuses().includes(order.current_status));
    } else {
      filtered = filtered.filter(order => getClosedStatuses().includes(order.current_status));
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_phone?.includes(term) ||
        order.title.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.current_status === statusFilter);
    }

    return filtered;
  }, [orders, activeTab, searchTerm, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const activeCount = orders.filter(order => getActiveStatuses().includes(order.current_status)).length;
  const pastCount = orders.filter(order => getClosedStatuses().includes(order.current_status)).length;

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const { error } = await supabase
        .from('order_status_events')
        .insert({
          order_id: selectedOrder.id,
          old_status: selectedOrder.current_status,
          new_status: selectedOrder.current_status,
          note: newNote,
          is_customer_visible: false,
          changed_by: user?.id
        });

      if (error) throw error;

      toast.success('ההערה נוספה בהצלחה');
      setNewNote('');
      fetchOrderDetails(selectedOrder.id);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('שגיאה בהוספת ההערה');
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={!!error}
      error={error}
      onRetry={() => refetch()}
    >
      <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
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
            <Button
              onClick={() => setCreateOrderDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4 ml-1" />
              הזמנה חדשה
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-nav-safe">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="active" className="gap-2">
              פעילות ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              עבר ({pastCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <OrdersTable 
              orders={paginatedOrders}
              onOrderClick={handleOrderClick}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              activeStatuses={getActiveStatuses()}
            />
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <OrdersTable 
              orders={paginatedOrders}
              onOrderClick={handleOrderClick}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              activeStatuses={getClosedStatuses()}
            />
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>הזמנה #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusDialogOpen(true)}
                >
                  עדכון סטטוס
                </Button>
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>סיכום הזמנה</span>
                      <StatusBadge status={selectedOrder.current_status} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">תאריך</Label>
                        <p className="font-medium">
                          {format(new Date(selectedOrder.created_at), 'dd/MM/yyyy', { locale: he })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">סכום</Label>
                        <p className="font-medium">₪{selectedOrder.total_ils?.toLocaleString('he-IL')}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">ETA</Label>
                        <p className="font-medium">
                          {selectedOrder.eta_at ? 
                            format(new Date(selectedOrder.eta_at), 'dd/MM/yyyy', { locale: he }) : 
                            'לא הוגדר'
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">לקוח</Label>
                        <p className="font-medium">{selectedOrder.customer_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>פרטי לקוח</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                      <div className="flex items-center gap-2">
                        <PhoneLink 
                          phone={selectedOrder.customer_phone}
                          phoneE164={selectedOrder.customer_phone_e164}
                          orderId={selectedOrder.id}
                        />
                      </div>
                    </div>
                    {selectedOrder.customer_email && (
                      <div className="text-sm text-muted-foreground">
                        {selectedOrder.customer_email}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Items */}
                {orderItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>פריטים</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>פריט</TableHead>
                            <TableHead>כמות</TableHead>
                            <TableHead>מחיר יחידה</TableHead>
                            <TableHead>סה״כ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>₪{item.unit_price.toLocaleString('he-IL')}</TableCell>
                              <TableCell>₪{(item.quantity * item.unit_price).toLocaleString('he-IL')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>ציר זמן</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Timeline 
                      events={statusEvents.map(event => ({
                        id: event.id,
                        type: 'status_change',
                        title: event.note || `עדכון סטטוס ל${event.new_status}`,
                        content: event.reason,
                        userName: event.user_profile?.full_name,
                        timestamp: event.created_at,
                        isCustomerVisible: event.is_customer_visible,
                        metadata: {
                          oldStatus: event.old_status,
                          newStatus: event.new_status
                        }
                      }))}
                    />
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>הערות פנימיות</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="הוסף הערה פנימית..."
                        rows={3}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={isAddingNote || !newNote.trim()}
                        size="sm"
                        className="self-end"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader>
                    <CardTitle>קבצים מצורפים</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FileUploader 
                      orderId={selectedOrder.id}
                      onFileUploaded={() => fetchOrderDetails(selectedOrder.id)}
                    />
                    <FileList
                      orderId={selectedOrder.id}
                      files={orderAttachments}
                      onFileDeleted={() => fetchOrderDetails(selectedOrder.id)}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Order Wizard */}
        <CreateOrderWizard
          open={createOrderDialogOpen}
          onOpenChange={setCreateOrderDialogOpen}
          onSuccess={() => {
            refetch();
          }}
        />

        {/* Status Update Dialog */}
        <StatusUpdateDialog
          order={selectedOrder}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onStatusUpdated={() => {
            refetch();
            if (selectedOrder) {
              fetchOrderDetails(selectedOrder.id);
            }
          }}
        />
      </div>
      </div>
    </PageBoundary>
  );
}

interface OrdersTableProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeStatuses: OrderStatus[];
}

function OrdersTable({
  orders,
  onOrderClick,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  activeStatuses
}: OrdersTableProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">חיפוש</Label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חפש לפי מספר הזמנה, שם לקוח או טלפון..."
              className="pr-10"
            />
          </div>
        </div>
        
        <div className="min-w-48">
          <Label htmlFor="status-filter">סטטוס</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {activeStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  <StatusBadge status={status} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># הזמנה</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>לקוח</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>סכום</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOrderClick(order)}
                >
                  <TableCell className="font-medium">
                    {order.order_number || order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: he })}
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <PhoneLink 
                      phone={order.customer_phone}
                      phoneE164={order.customer_phone_e164}
                      orderId={order.id}
                    />
                  </TableCell>
                  <TableCell>₪{order.total_ils?.toLocaleString('he-IL')}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.current_status} />
                  </TableCell>
                  <TableCell>
                    {order.eta_at ? 
                      format(new Date(order.eta_at), 'dd/MM', { locale: he }) : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderClick(order);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              אין הזמנות להצגה
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(i + 1);
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}