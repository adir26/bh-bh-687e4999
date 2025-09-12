import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { leadsService, Lead, LeadStatus } from '@/services/leadsService';
import { crmAutomationService } from '@/services/crmAutomationService';
import { SLABadge } from '@/components/crm/SLABadge';
import { LeadAssignmentDropdown } from '@/components/crm/LeadAssignmentDropdown';
import { SLAMetricsWidget } from '@/components/crm/SLAMetricsWidget';
import { QuickActionsMenu } from '@/components/crm/QuickActionsMenu';
import { Phone, Mail, StickyNote, MessageCircle, FileText, ArrowUpDown, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'proposal_sent', 'won', 'lost'];

function statusLabel(s: LeadStatus) {
  switch (s) {
    case 'new': return 'New';
    case 'contacted': return 'Contacted';
    case 'proposal_sent': return 'Proposal Sent';
    case 'won': return 'Won';
    case 'lost': return 'Lost';
  }
}

const statusBadgeVariant: Record<LeadStatus, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  proposal_sent: 'outline',
  won: 'default',
  lost: 'outline',
};

function SupplierCRMContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['supplier-leads', user?.id, statusFilter, sourceFilter, search, sort],
    enabled: !!user?.id,
    queryFn: async ({ signal }) => {
      const data = await leadsService.listLeads(user!.id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        search,
        sort,
      });
      return data;
    },
    retry: 1,
    staleTime: 30_000,
  });

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { new: [], contacted: [], proposal_sent: [], won: [], lost: [] };
    for (const l of leads) {
      if (STATUSES.includes(l.status)) {
        map[l.status].push(l);
      }
    }
    return map;
  }, [leads]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) =>
      leadsService.updateLeadStatus(leadId, newStatus),
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'Lead updated', description: `Status changed to ${statusLabel(newStatus)}` });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update status', description: error.message, variant: 'destructive' });
    }
  });

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    updateStatusMutation.mutate({ leadId, newStatus });
  };

  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: string }) =>
      leadsService.addLeadNote(leadId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'Note added' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add note', description: error.message, variant: 'destructive' });
    }
  });

  const createQuoteMutation = useMutation({
    mutationFn: (leadId: string) => leadsService.createQuoteFromLead(leadId),
    onSuccess: () => {
      toast({ title: 'Quote draft created' });
      navigate('/supplier/quotes');
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create quote', description: error.message, variant: 'destructive' });
    }
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ leadId, hours }: { leadId: string; hours: number }) =>
      crmAutomationService.snoozeLead(leadId, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'Lead snoozed' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to snooze lead', description: error.message, variant: 'destructive' });
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, assigneeId }: { leadId: string; assigneeId: string }) =>
      crmAutomationService.assignLead(leadId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'Lead assigned' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to assign lead', description: error.message, variant: 'destructive' });
    }
  });

  const addNote = (leadId: string, note: string) => {
    addNoteMutation.mutate({ leadId, note });
  };

  const createQuote = (leadId: string) => {
    createQuoteMutation.mutate(leadId);
  };

  const snoozeLead = (leadId: string, hours: number) => {
    snoozeMutation.mutate({ leadId, hours });
  };

  const assignLead = (leadId: string, assigneeId: string) => {
    assignMutation.mutate({ leadId, assigneeId });
  };

  const Kanban = () => (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {STATUSES.map((status) => (
          <div key={status} id={status}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{statusLabel(status)}</span>
                  <Badge variant={statusBadgeVariant[status]}>{leadsByStatus[status]?.length || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <SortableContext items={(leadsByStatus[status] || []).map((l) => l.id)} strategy={verticalListSortingStrategy}>
                   <div className="space-y-3">
                     {(leadsByStatus[status] || []).map((lead) => (
                       <LeadCard 
                         key={lead.id} 
                         lead={lead} 
                         onAddNote={addNote} 
                         onCreateQuote={createQuote}
                         onSnooze={snoozeLead}
                         onAssign={assignLead}
                       />
                     ))}
                   </div>
                 </SortableContext>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DndContext>
  );

  const List = () => (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                 <th className="p-3 text-left">Name</th>
                 <th className="p-3 text-left">Phone</th>
                 <th className="p-3 text-left">Email</th>
                 <th className="p-3 text-left">Status</th>
                 <th className="p-3 text-left">SLA</th>
                 <th className="p-3 text-left">Assigned</th>
                 <th className="p-3 text-left">Last Contact</th>
                 <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b">
                   <td className="p-3">{l.name || '—'}</td>
                   <td className="p-3">
                     {l.contact_phone ? (
                       <a href={`tel:${l.contact_phone}`} className="underline">{l.contact_phone}</a>
                     ) : '—'}
                   </td>
                   <td className="p-3">
                     {l.contact_email ? (
                       <a href={`mailto:${l.contact_email}`} className="underline">{l.contact_email}</a>
                     ) : '—'}
                   </td>
                   <td className="p-3"><Badge>{statusLabel(l.status)}</Badge></td>
                   <td className="p-3">
                     <SLABadge lead={l} />
                   </td>
                   <td className="p-3">
                     <LeadAssignmentDropdown 
                       leadId={l.id} 
                       currentAssignee={l.assigned_to} 
                       onAssign={assignLead}
                     />
                   </td>
                   <td className="p-3">{l.last_contact_date ? format(new Date(l.last_contact_date), 'dd/MM/yy HH:mm') : '—'}</td>
                   <td className="p-3">
                     <QuickActionsMenu 
                       leadId={l.id}
                       onAddNote={addNote}
                       onCreateQuote={createQuote}
                       onSnooze={snoozeLead}
                     />
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Leads CRM</h1>
            <p className="text-sm text-muted-foreground">Manage your pipeline: drag between stages, add notes, and create quotes.</p>
          </div>
        </div>
        <SLAMetricsWidget supplierId={user?.id} />
      </header>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input placeholder="Search by name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="ghost" onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}>
            <ArrowUpDown className="mr-2 h-4 w-4" /> {sort === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <Separator />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="שגיאה בטעינת הלידים"
          description="אירעה שגיאה בטעינת הנתונים. אנא נסו שוב."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="אין לידים"
          description="לא נמצאו לידים התואמים לחיפוש שלכם."
        />
      ) : view === 'kanban' ? (
        <Kanban />
      ) : (
        <List />
      )}
    </main>
  );
}

export default function SupplierCRM() {
  return (
    <PageBoundary timeout={10000}>
      <SupplierCRMContent />
    </PageBoundary>
  );
}

function LeadCard({ 
  lead, 
  onAddNote, 
  onCreateQuote, 
  onSnooze, 
  onAssign 
}: { 
  lead: Lead; 
  onAddNote: (id: string, note: string) => void; 
  onCreateQuote: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
  onAssign: (id: string, assigneeId: string) => void;
}) {
  return (
    <div id={lead.id} className="rounded-md border p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{lead.name || '—'}</div>
          <div className="mt-1 text-xs text-muted-foreground">{lead.source || '—'}</div>
        </div>
        <div className="flex items-center gap-2">
          <SLABadge lead={lead} />
          <Badge>{statusLabel(lead.status)}</Badge>
        </div>
      </div>
      <div className="mt-2">
        <LeadAssignmentDropdown 
          leadId={lead.id} 
          currentAssignee={lead.assigned_to} 
          onAssign={onAssign}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {lead.contact_phone && (
          <a className="inline-flex items-center gap-1 underline" href={`tel:${lead.contact_phone}`}><Phone className="h-4 w-4" />Call</a>
        )}
        {lead.contact_email && (
          <a className="inline-flex items-center gap-1 underline" href={`mailto:${lead.contact_email}`}><Mail className="h-4 w-4" />Email</a>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <QuickActionsMenu 
          leadId={lead.id}
          onAddNote={onAddNote}
          onCreateQuote={onCreateQuote}
          onSnooze={onSnooze}
        />
      </div>
      {lead.last_contact_date && (
        <div className="mt-2 text-xs text-muted-foreground">Last contact: {format(new Date(lead.last_contact_date), 'dd/MM/yy HH:mm')}</div>
      )}
    </div>
  );
}

function AddNoteInline({ onSave }: { onSave: (note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div>
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <StickyNote className="mr-2 h-4 w-4" /> Note
        </Button>
      ) : (
        <div className="flex w-full max-w-sm items-center gap-2">
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add a note..." />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { onSave(value); setValue(''); setOpen(false); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setValue(''); }}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
