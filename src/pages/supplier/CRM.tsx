import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragEndEvent } from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { leadsService, Lead, LeadStatus } from '@/services/leadsService';
import { crmAutomationService } from '@/services/crmAutomationService';
import { STATUSES } from '@/utils/leadHelpers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageBoundary } from '@/components/system/PageBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { AddLeadDialog } from '@/components/crm/AddLeadDialog';
import { LeadDetailDialog } from '@/components/crm/LeadDetailDialog';
import { LeadImportWizard } from '@/components/crm/LeadImportWizard';
import { ImportHistoryTable } from '@/components/crm/ImportHistoryTable';
import { CRMHeader } from '@/components/crm/CRMHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadListTable } from '@/components/crm/LeadListTable';
import { statusLabel } from '@/utils/leadHelpers';

function SupplierCRMContent({ leads, view, setView, search, setSearch, statusFilter, setStatusFilter, sourceFilter, setSourceFilter, sort, setSort }: {
  leads: Lead[];
  view: 'kanban' | 'list';
  setView: (v: 'kanban' | 'list') => void;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: LeadStatus | 'all';
  setStatusFilter: (s: LeadStatus | 'all') => void;
  sourceFilter: string | 'all';
  setSourceFilter: (s: string) => void;
  sort: 'newest' | 'oldest';
  setSort: (s: 'newest' | 'oldest') => void;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'history'>('leads');

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { 
      new: [], no_answer: [], followup: [], no_answer_x5: [], not_relevant: [], 
      error: [], denies_contact: [], project_in_process: [], project_completed: []
    };
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
      toast({ title: 'ליד עודכן', description: `הסטטוס שונה ל-${statusLabel(newStatus)}` });
    },
    onError: (error: any) => {
      toast({ title: 'שגיאה בעדכון הסטטוס', description: error.message, variant: 'destructive' });
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
      toast({ title: 'הערה נוספה' });
    },
    onError: (error: any) => {
      toast({ title: 'שגיאה בהוספת הערה', description: error.message, variant: 'destructive' });
    }
  });

  const createQuoteMutation = useMutation({
    mutationFn: (leadId: string) => leadsService.createQuoteFromLead(leadId),
    onSuccess: () => {
      toast({ title: 'טיוטת הצעת מחיר נוצרה' });
      navigate('/supplier/quotes');
    },
    onError: (error: any) => {
      toast({ title: 'שגיאה ביצירת הצעת מחיר', description: error.message, variant: 'destructive' });
    }
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ leadId, hours }: { leadId: string; hours: number }) =>
      crmAutomationService.snoozeLead(leadId, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'הליד נדחה' });
    },
    onError: (error: any) => {
      toast({ title: 'שגיאה בדחיית הליד', description: error.message, variant: 'destructive' });
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, assigneeId }: { leadId: string; assigneeId: string }) =>
      crmAutomationService.assignLead(leadId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
      toast({ title: 'הליד הוקצה' });
    },
    onError: (error: any) => {
      toast({ title: 'שגיאה בהקצאת הליד', description: error.message, variant: 'destructive' });
    }
  });

  const addNote = (leadId: string, note: string) => addNoteMutation.mutate({ leadId, note });
  const createQuote = (leadId: string) => createQuoteMutation.mutate(leadId);
  const snoozeLead = (leadId: string, hours: number) => snoozeMutation.mutate({ leadId, hours });
  const assignLead = (leadId: string, assigneeId: string) => assignMutation.mutate({ leadId, assigneeId });

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-3 sm:px-4 lg:px-6 pt-[max(env(safe-area-inset-top),16px)] pb-nav-safe" dir="rtl">
      <CRMHeader
        supplierId={user?.id}
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        sort={sort} setSort={setSort}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onAddLead={() => setAddLeadDialogOpen(true)}
        onImport={() => setImportWizardOpen(true)}
      />

      <AddLeadDialog open={addLeadDialogOpen} onOpenChange={setAddLeadDialogOpen} />
      <LeadDetailDialog 
        leadId={selectedLeadId} 
        open={!!selectedLeadId} 
        onOpenChange={(open) => !open && setSelectedLeadId(null)} 
      />
      <LeadImportWizard
        open={importWizardOpen}
        onOpenChange={setImportWizardOpen}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
          toast({ title: 'הייבוא הושלם בהצלחה' });
        }}
      />

      {activeTab === 'history' ? (
        <div className="py-6">
          <ImportHistoryTable />
        </div>
      ) : (
        <>
          {leads.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Users}
                title="אין לידים עדיין"
                description="ברגע שלקוחות יתעניינו בשירותים שלך, הלידים יופיעו כאן. בינתיים אפשר להוסיף ליד ידנית."
                action={{
                  label: 'הוסף ליד חדש',
                  onClick: () => setAddLeadDialogOpen(true)
                }}
              />
            </div>
          ) : view === 'kanban' ? (
            <KanbanBoard
              leads={leads}
              leadsByStatus={leadsByStatus}
              onDragEnd={onDragEnd}
              onLeadClick={(id) => setSelectedLeadId(id)}
            />
          ) : (
            <LeadListTable
              leads={leads}
              onLeadClick={(id) => setSelectedLeadId(id)}
              onAddNote={addNote}
              onCreateQuote={createQuote}
              onSnooze={snoozeLead}
              onAssign={assignLead}
            />
          )}
        </>
      )}
    </main>
  );
}

export default function SupplierCRM() {
  const { user } = useAuth();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['supplier-leads', user?.id, statusFilter, sourceFilter, debouncedSearch, sort],
    enabled: !!user?.id,
    queryFn: async () => {
      const data = await leadsService.listLeads(user!.id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        search: debouncedSearch,
        sort,
      });
      return data;
    },
    retry: 1,
    staleTime: 30_000,
  });

  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={!!error}
      error={error}
      onRetry={refetch}
    >
      <SupplierCRMContent 
        leads={leads}
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        sort={sort} setSort={setSort}
      />
    </PageBoundary>
  );
}
