import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LeadStatus } from '@/services/leadsService';
import { STATUSES, statusLabel } from '@/utils/leadHelpers';
import { ArrowUpDown, Plus, Upload, Users, History } from 'lucide-react';
import { SLAMetricsWidget } from '@/components/crm/SLAMetricsWidget';

interface CRMHeaderProps {
  supplierId?: string;
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
  activeTab: 'leads' | 'history';
  setActiveTab: (t: 'leads' | 'history') => void;
  onAddLead: () => void;
  onImport: () => void;
}

export function CRMHeader({
  supplierId,
  view, setView,
  search, setSearch,
  statusFilter, setStatusFilter,
  sourceFilter, setSourceFilter,
  sort, setSort,
  activeTab, setActiveTab,
  onAddLead, onImport,
}: CRMHeaderProps) {
  return (
    <>
      <header className="space-y-3 sm:space-y-4 sticky top-0 z-10 bg-background py-2 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">ניהול לידים - CRM</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">נהל את הלידים שלך: גרור בין שלבים, לחץ לפרטים מלאים</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={onImport}>
              <Upload className="ml-1 sm:ml-2 h-4 w-4" />
              <span className="hidden xs:inline">ייבוא מקובץ</span>
              <span className="xs:hidden">ייבוא</span>
            </Button>
            <Button variant="blue" size="sm" className="text-xs sm:text-sm" onClick={onAddLead}>
              <Plus className="ml-1 sm:ml-2 h-4 w-4" />
              <span className="hidden xs:inline">הוסף ליד</span>
              <span className="xs:hidden">הוסף</span>
            </Button>
          </div>
        </div>
        <SLAMetricsWidget supplierId={supplierId} />
      </header>

      {/* Tabs for Leads vs Import History */}
      <div className="border-b overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex gap-1 sm:gap-4 min-w-max">
          <button
            className={`px-3 sm:px-4 py-2 sm:py-3 border-b-2 transition-colors text-sm sm:text-base min-h-[44px] ${
              activeTab === 'leads'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('leads')}
          >
            <Users className="w-4 h-4 inline ml-1 sm:ml-2" />
            לידים
          </button>
          <button
            className={`px-3 sm:px-4 py-2 sm:py-3 border-b-2 transition-colors text-sm sm:text-base min-h-[44px] ${
              activeTab === 'history'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4 inline ml-1 sm:ml-2" />
            <span className="hidden sm:inline">היסטוריית ייבואים</span>
            <span className="sm:hidden">היסטוריה</span>
          </button>
        </div>
      </div>

      {activeTab === 'leads' && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <Input placeholder="חיפוש לפי שם, אימייל, טלפון..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 min-h-[44px]" onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}>
              <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4" /> {sort === 'newest' ? 'חדש לישן' : 'ישן לחדש'}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="סטטוס" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="מקור" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המקורות</SelectItem>
                <SelectItem value="website">אתר</SelectItem>
                <SelectItem value="facebook_paid">פייסבוק ממומן</SelectItem>
                <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                <SelectItem value="word_of_mouth">פה לאוזן</SelectItem>
                <SelectItem value="referral">הפניה</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger value="kanban" className="text-xs sm:text-sm">לוח קנבן</TabsTrigger>
                <TabsTrigger value="list" className="text-xs sm:text-sm">רשימה</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>
      )}

      {activeTab === 'leads' && <Separator />}
    </>
  );
}
