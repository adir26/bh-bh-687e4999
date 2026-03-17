import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, DollarSign, Clock, CheckCircle, XCircle, Package, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'ממתינה', className: 'bg-accent/50 text-accent-foreground' },
  confirmed: { label: 'מאושרת', className: 'bg-primary/10 text-primary' },
  in_progress: { label: 'בביצוע', className: 'bg-chart-4/10 text-chart-4' },
  completed: { label: 'הושלמה', className: 'bg-chart-2/10 text-chart-2' },
  canceled: { label: 'בוטלה', className: 'bg-destructive/10 text-destructive' },
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', searchTerm, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, client:profiles!orders_client_id_fkey(full_name, email), supplier:profiles!orders_supplier_id_fkey(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { orders: data || [], total: count || 0 };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async () => {
      const [total, pending, completed, revenue] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('orders').select('amount').eq('status', 'completed'),
      ]);
      const totalRevenue = (revenue.data || []).reduce((s: number, o: any) => s + (o.amount || 0), 0);
      return {
        total: total.count || 0,
        pending: pending.count || 0,
        completed: completed.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const orders = data?.orders || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">ניהול הזמנות</h1>
        <p className="text-muted-foreground text-sm">מעקב והתערבות בהזמנות הפלטפורמה</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-lg md:text-2xl font-bold">{stats?.total?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">סה"כ הזמנות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <div className="text-lg md:text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">ממתינות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <CheckCircle className="h-4 w-4 text-muted-foreground mb-1" />
            <div className="text-lg md:text-2xl font-bold">{stats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">הושלמו</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
            <div className="text-lg md:text-2xl font-bold">₪{(stats?.revenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">הכנסות</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="חיפוש הזמנות..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          onClear={() => setSearchTerm('')}
          className="flex-1 max-w-md"
          dir="rtl"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="pending">ממתינה</SelectItem>
            <SelectItem value="confirmed">מאושרת</SelectItem>
            <SelectItem value="in_progress">בביצוע</SelectItem>
            <SelectItem value="completed">הושלמה</SelectItem>
            <SelectItem value="canceled">בוטלה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : orders.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">לא נמצאו הזמנות</CardContent></Card>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate max-w-[200px]">{order.title || 'הזמנה'}</span>
                  <Badge className={cn('text-xs', STATUS_MAP[order.status]?.className)}>{STATUS_MAP[order.status]?.label || order.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>לקוח: {order.customer_name || order.client?.full_name || 'לא ידוע'}</p>
                  <p>סכום: ₪{(order.amount || 0).toLocaleString()}</p>
                  <p>{format(new Date(order.created_at), 'dd/MM/yyyy', { locale: he })}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">הזמנה</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">ספק</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">לא נמצאו הזמנות</TableCell></TableRow>
                ) : orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-right font-medium">
                      <span className="truncate max-w-[200px] block">{order.title || 'הזמנה'}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm">{order.customer_name || order.client?.full_name || '—'}</TableCell>
                    <TableCell className="text-right text-sm">{order.supplier?.full_name || '—'}</TableCell>
                    <TableCell className="text-right">₪{(order.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn('text-xs', STATUS_MAP[order.status]?.className)}>{STATUS_MAP[order.status]?.label || order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>הקודם</Button>
          <span className="text-sm text-muted-foreground">עמוד {page} מתוך {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>הבא</Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>פרטי הזמנה</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">כותרת:</span><p className="font-medium">{selectedOrder.title || 'הזמנה'}</p></div>
                <div><span className="text-muted-foreground">סטטוס:</span><p><Badge className={cn('text-xs', STATUS_MAP[selectedOrder.status]?.className)}>{STATUS_MAP[selectedOrder.status]?.label}</Badge></p></div>
                <div><span className="text-muted-foreground">לקוח:</span><p>{selectedOrder.customer_name || selectedOrder.client?.full_name || '—'}</p></div>
                <div><span className="text-muted-foreground">ספק:</span><p>{selectedOrder.supplier?.full_name || '—'}</p></div>
                <div><span className="text-muted-foreground">סכום:</span><p className="font-bold">₪{(selectedOrder.amount || 0).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">תאריך:</span><p>{format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}</p></div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">הערות:</span>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
