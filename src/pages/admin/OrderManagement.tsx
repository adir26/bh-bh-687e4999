import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Eye, MoreHorizontal, DollarSign, ShoppingCart, Clock, CheckCircle, RefreshCw, CreditCard } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminOrders, useOrderMutations, useOrderRefunds, useOrderRealtimeSubscription } from "@/hooks/useAdminOrders";
import { OrderFilters, PaginationParams, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/types/admin";
import { toast } from "sonner";
import { FEATURES } from "@/config/featureFlags";

const ITEMS_PER_PAGE = 25;

export default function AdminOrderManagement() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const pagination: PaginationParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE
  };

  const currentFilters = { ...filters, search: debouncedSearch };
  const { orders, totalCount, totalPages, isLoading } = useAdminOrders(currentFilters, pagination);
  const { updateOrderStatus, updatePaymentStatus, processRefund } = useOrderMutations();
  const { data: refunds } = useOrderRefunds(selectedOrder?.id);

  // Real-time subscription
  useOrderRealtimeSubscription();

  const handleStatusUpdate = async (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleRefund = async (order: any) => {
    setSelectedOrder(order);
    setRefundAmount("");
    setRefundReason("");
    setRefundDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    await updateOrderStatus.mutateAsync({
      id: selectedOrder.id,
      status: newStatus,
      note: statusNote
    });

    setStatusDialogOpen(false);
    setNewStatus("");
    setStatusNote("");
    setSelectedOrder(null);
  };

  const confirmRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('סכום לא תקין');
      return;
    }

    await processRefund.mutateAsync({
      orderId: selectedOrder.id,
      amount,
      reason: refundReason
    });

    setRefundDialogOpen(false);
    setRefundAmount("");
    setRefundReason("");
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof ORDER_STATUS_LABELS;
    const label = ORDER_STATUS_LABELS[statusKey] || status;
    
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">{label}</Badge>;
      case "in_progress":
      case "confirmed":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">{label}</Badge>;
      case "pending":
        return <Badge variant="secondary">{label}</Badge>;
      case "canceled":
        return <Badge variant="destructive">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusKey = paymentStatus as keyof typeof PAYMENT_STATUS_LABELS;
    const label = PAYMENT_STATUS_LABELS[statusKey] || paymentStatus;
    
    switch (paymentStatus) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800">{label}</Badge>;
      case "partial":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">{label}</Badge>;
      case "refunded":
        return <Badge variant="destructive">{label}</Badge>;
      case "unpaid":
      default:
        return <Badge variant="secondary">{label}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString()}`;
  };

  const stats = {
    total: totalCount,
    revenue: orders.reduce((sum, order) => sum + Number(order.amount), 0),
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">טוען נתוני הזמנות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew" dir="rtl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight rtl-text-right">ניהול הזמנות</h1>
            <p className="text-muted-foreground text-mobile-sm md:text-base rtl-text-right">מעקב וניהול כל הזמנות הפלטפורמה</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="חיפוש הזמנות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="text-right min-h-input prevent-zoom"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filters.status || ""} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value }))
            }>
              <SelectTrigger className="w-40 font-hebrew">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">הכל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="confirmed">מאושר</SelectItem>
                <SelectItem value="in_progress">בטיפול</SelectItem>
                <SelectItem value="completed">הושלם</SelectItem>
                <SelectItem value="canceled">בוטל</SelectItem>
              </SelectContent>
            </Select>
            
            {FEATURES.PAYMENTS_ENABLED && (
              <Select value={filters.payment_status || ""} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, payment_status: value }))
              }>
                <SelectTrigger className="w-40 font-hebrew">
                  <SelectValue placeholder="תשלום" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">הכל</SelectItem>
                  <SelectItem value="unpaid">לא שולם</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="partial">שולם חלקית</SelectItem>
                  <SelectItem value="refunded">הוחזר</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" size="sm" className="font-hebrew min-h-button">
              <Filter className="h-4 w-4 ml-2" />
              סינון
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="responsive-grid-2 md:responsive-grid-4">
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <div className="text-lg md:text-2xl font-bold text-right">{stats.total.toLocaleString()}</div>
            </div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ הזמנות</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="text-lg md:text-2xl font-bold text-right">{formatCurrency(stats.revenue)}</div>
            </div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">הכנסות</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="text-lg md:text-2xl font-bold text-right">{stats.pending}</div>
            </div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">ממתינות</p>
          </CardContent>
        </Card>
        <Card className="mobile-card">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-lg md:text-2xl font-bold text-right">{stats.completed}</div>
            </div>
            <p className="text-mobile-xs md:text-sm font-medium text-muted-foreground text-right">הושלמו</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Order Cards */}
      <div className="block md:hidden space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="mobile-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-right truncate">{order.order_number || order.id.substring(0, 8)}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between text-right">
                      <span>לקוח:</span>
                      <span className="truncate">{order.client_profile?.full_name || 'לקוח'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-right">
                      <span>ספק:</span>
                      <span className="truncate">{order.supplier_profile?.full_name || 'ספק'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-right">
                      <span>סכום:</span>
                      <span className="font-bold">{formatCurrency(Number(order.amount))}</span>
                    </div>
                    
                    {FEATURES.PAYMENTS_ENABLED && (
                      <div className="flex items-center justify-between text-right">
                        <span>תשלום:</span>
                        {getPaymentStatusBadge(order.payment_status || 'unpaid')}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-right">
                      <span>תאריך:</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background border shadow-lg">
                    <DropdownMenuItem className="font-hebrew text-right">
                      <Eye className="h-4 w-4 ml-2" />
                      צפייה בפרטים
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-hebrew text-right"
                      onClick={() => handleStatusUpdate(order)}
                    >
                      <RefreshCw className="h-4 w-4 ml-2" />
                      עדכון סטטוס
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-hebrew text-right"
                      onClick={() => handleRefund(order)}
                    >
                      <CreditCard className="h-4 w-4 ml-2" />
                      החזר כספי
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block mobile-card">
        <CardHeader>
          <CardTitle className="text-right font-hebrew">הזמנות</CardTitle>
        </CardHeader>
        <CardContent className="table-mobile-wrapper">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מזהה הזמנה</TableHead>
                <TableHead className="text-right">לקוח</TableHead>
                <TableHead className="text-right">ספק</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                {FEATURES.PAYMENTS_ENABLED && (
                  <TableHead className="text-right">תשלום</TableHead>
                )}
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-right">
                    {order.order_number || order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{order.client_profile?.full_name || 'לקוח'}</div>
                      <div className="text-sm text-muted-foreground">{order.client_profile?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.supplier_profile?.full_name || 'ספק'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(order.amount))}
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(order.status)}</TableCell>
                  {FEATURES.PAYMENTS_ENABLED && (
                    <TableCell className="text-right">{getPaymentStatusBadge(order.payment_status || 'unpaid')}</TableCell>
                  )}
                  <TableCell className="text-right">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-background border shadow-lg">
                        <DropdownMenuItem className="font-hebrew text-right">
                          <Eye className="h-4 w-4 ml-2" />
                          צפייה בפרטים
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="font-hebrew text-right"
                          onClick={() => handleStatusUpdate(order)}
                        >
                          <RefreshCw className="h-4 w-4 ml-2" />
                          עדכון סטטוס
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="font-hebrew text-right"
                          onClick={() => handleRefund(order)}
                        >
                          <CreditCard className="h-4 w-4 ml-2" />
                          החזר כספי
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="font-hebrew"
          >
            הקודם
          </Button>
          <span className="font-hebrew">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="font-hebrew"
          >
            הבא
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="font-hebrew" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">עדכון סטטוס הזמנה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-right">סטטוס חדש</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="in_progress">בטיפול</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="canceled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-right">הערה (אופציונלי)</Label>
              <Textarea 
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="הוסף הערה..."
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={confirmStatusUpdate} disabled={!newStatus}>
              עדכן
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="font-hebrew" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">החזר כספי</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-right">סכום להחזר</Label>
              <Input 
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="text-right"
                dir="rtl"
              />
              {selectedOrder && (
                <p className="text-sm text-muted-foreground text-right mt-1">
                  סכום הזמנה: {formatCurrency(Number(selectedOrder.amount))}
                  {selectedOrder.refunded_total > 0 && (
                    <span> (הוחזר: {formatCurrency(selectedOrder.refunded_total)})</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <Label className="text-right">סיבה להחזר</Label>
              <Textarea 
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="הזן סיבה להחזר..."
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={confirmRefund} 
              disabled={!refundAmount || !refundReason}
              variant="destructive"
            >
              בצע החזר
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}