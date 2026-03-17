import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageSquare, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showToast } from '@/utils/toast';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  open: { label: 'פתוח', className: 'bg-destructive/10 text-destructive' },
  in_progress: { label: 'בטיפול', className: 'bg-chart-4/10 text-chart-4' },
  resolved: { label: 'נפתר', className: 'bg-chart-2/10 text-chart-2' },
  closed: { label: 'סגור', className: 'bg-muted text-muted-foreground' },
};

const PRIORITY_MAP: Record<string, { label: string; className: string }> = {
  low: { label: 'נמוכה', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'בינונית', className: 'bg-chart-4/10 text-chart-4' },
  high: { label: 'גבוהה', className: 'bg-destructive/10 text-destructive' },
  urgent: { label: 'דחוף', className: 'bg-destructive text-destructive-foreground' },
};

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-tickets', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*, user:profiles!support_tickets_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,ticket_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, admin_notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setSelectedTicket(null);
      setAdminNotes('');
      setNewStatus('');
      showToast.success('הטיקט עודכן בהצלחה');
    },
    onError: () => showToast.error('שגיאה בעדכון הטיקט'),
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t: any) => t.status === 'open').length,
    inProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: any) => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew pb-nav-safe" dir="rtl">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">מערכת תמיכה</h1>
        <p className="text-muted-foreground text-sm">ניהול פניות ותלונות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">סה"כ פניות</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <AlertTriangle className="h-4 w-4 text-destructive mb-1" />
          <div className="text-lg font-bold">{stats.open}</div>
          <p className="text-xs text-muted-foreground">פתוחות</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">בטיפול</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <CheckCircle className="h-4 w-4 text-muted-foreground mb-1" />
          <div className="text-lg font-bold">{stats.resolved}</div>
          <p className="text-xs text-muted-foreground">נפתרו</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="חיפוש פניות..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          className="flex-1 max-w-md"
          dir="rtl"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="open">פתוח</SelectItem>
            <SelectItem value="in_progress">בטיפול</SelectItem>
            <SelectItem value="resolved">נפתר</SelectItem>
            <SelectItem value="closed">סגור</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : tickets.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">אין פניות תמיכה</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setSelectedTicket(ticket); setNewStatus(ticket.status); setAdminNotes(ticket.admin_notes || ''); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{ticket.title || 'פנייה'}</span>
                      {ticket.ticket_number && <span className="text-xs text-muted-foreground">#{ticket.ticket_number}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{ticket.user?.full_name || 'משתמש'}</span>
                      <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <Badge className={cn('text-xs', STATUS_MAP[ticket.status]?.className)}>{STATUS_MAP[ticket.status]?.label || ticket.status}</Badge>
                    {ticket.priority && <Badge className={cn('text-xs', PRIORITY_MAP[ticket.priority]?.className)}>{PRIORITY_MAP[ticket.priority]?.label}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>פרטי פנייה {selectedTicket?.ticket_number && `#${selectedTicket.ticket_number}`}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedTicket.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">פונה:</span><p>{selectedTicket.user?.full_name || 'משתמש'}</p></div>
                <div><span className="text-muted-foreground">תאריך:</span><p>{format(new Date(selectedTicket.created_at), 'dd/MM/yyyy HH:mm')}</p></div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">עדכון סטטוס</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">פתוח</SelectItem>
                    <SelectItem value="in_progress">בטיפול</SelectItem>
                    <SelectItem value="resolved">נפתר</SelectItem>
                    <SelectItem value="closed">סגור</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">הערות מנהל</label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="הוסף הערות..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>ביטול</Button>
            <Button 
              onClick={() => selectedTicket && updateTicket.mutate({ id: selectedTicket.id, status: newStatus, admin_notes: adminNotes })}
              disabled={updateTicket.isPending}
            >
              {updateTicket.isPending ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
