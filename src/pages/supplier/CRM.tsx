import React, { useEffect, useMemo, useState } from 'react';
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
import { Phone, Mail, StickyNote, MessageCircle, FileText, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

export default function SupplierCRM() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    document.title = 'Supplier CRM - Leads Pipeline';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage leads pipeline: track status, add notes, and create quotes.');
  }, []);

  const fetchLeads = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await leadsService.listLeads(user.id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        search,
        sort,
      });
      setLeads(data);
    } catch (e: any) {
      toast({ title: 'Failed to load leads', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, statusFilter, sourceFilter, search, sort]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { new: [], contacted: [], proposal_sent: [], won: [], lost: [] };
    for (const l of leads) {
      if (STATUSES.includes(l.status)) {
        map[l.status].push(l);
      }
    }
    return map;
  }, [leads]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStatus = over.id as LeadStatus; // droppable id is status
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    try {
      await leadsService.updateLeadStatus(leadId, newStatus);
      toast({ title: 'Lead updated', description: `Status changed to ${statusLabel(newStatus)}` });
    } catch (e: any) {
      // revert
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)));
      toast({ title: 'Failed to update status', description: e.message, variant: 'destructive' });
    }
  };

  const addNote = async (leadId: string, note: string) => {
    try {
      await leadsService.addLeadNote(leadId, note);
      toast({ title: 'Note added' });
      fetchLeads();
    } catch (e: any) {
      toast({ title: 'Failed to add note', description: e.message, variant: 'destructive' });
    }
  };

  const createQuote = async (leadId: string) => {
    try {
      await leadsService.createQuoteFromLead(leadId);
      toast({ title: 'Quote draft created' });
      navigate('/supplier/quotes');
    } catch (e: any) {
      toast({ title: 'Failed to create quote', description: e.message, variant: 'destructive' });
    }
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
                      <LeadCard key={lead.id} lead={lead} onAddNote={addNote} onCreateQuote={createQuote} />
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
                  <td className="p-3">{l.last_contact_date ? format(new Date(l.last_contact_date), 'dd/MM/yy HH:mm') : '—'}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => toast({ title: 'Chat not available yet' })}><MessageCircle className="h-4 w-4" /></Button>
                      <Button size="sm" variant="secondary" onClick={() => createQuote(l.id)}><FileText className="h-4 w-4" /></Button>
                      <AddNoteInline onSave={(note) => addNote(l.id, note)} />
                    </div>
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
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Leads CRM</h1>
        <p className="text-sm text-muted-foreground">Manage your pipeline: drag between stages, add notes, and create quotes.</p>
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

      {loading ? (
        <p>Loading...</p>
      ) : view === 'kanban' ? (
        <Kanban />
      ) : (
        <List />
      )}
    </main>
  );
}

function LeadCard({ lead, onAddNote, onCreateQuote }: { lead: Lead; onAddNote: (id: string, note: string) => void; onCreateQuote: (id: string) => void }) {
  return (
    <div id={lead.id} className="rounded-md border p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{lead.name || '—'}</div>
          <div className="mt-1 text-xs text-muted-foreground">{lead.source || '—'}</div>
        </div>
        <Badge>{statusLabel(lead.status)}</Badge>
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
        <Button variant="secondary" size="sm" onClick={() => onCreateQuote(lead.id)}><FileText className="mr-2 h-4 w-4" />Quote</Button>
        <AddNoteInline onSave={(note) => onAddNote(lead.id, note)} />
        <Button variant="ghost" size="sm" onClick={() => alert('Chat not available yet')}><MessageCircle className="mr-2 h-4 w-4" />Chat</Button>
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
