import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InspectionKPICards } from '@/components/inspection/InspectionKPICards';
import { InspectionFilters } from '@/components/inspection/InspectionFilters';
import { InspectionTable } from '@/components/inspection/InspectionTable';
import { useInspectionReports, useInspectionKPIs, InspectionReportFilters } from '@/hooks/useInspectionReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InspectionDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL
  const [filters, setFilters] = useState<InspectionReportFilters>(() => {
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const report_type = searchParams.get('report_type') || undefined;
    const dateFrom = searchParams.get('from') || undefined;
    const dateTo = searchParams.get('to') || undefined;
    const search = searchParams.get('search') || undefined;

    return {
      status: status && status.length > 0 ? status : undefined,
      report_type,
      dateFrom,
      dateTo,
      search,
    };
  });

  const { data: reports = [], isLoading: reportsLoading } = useInspectionReports(filters);
  const { data: kpis, isLoading: kpisLoading } = useInspectionKPIs();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }
    if (filters.report_type) {
      params.set('report_type', filters.report_type);
    }
    if (filters.dateFrom) {
      params.set('from', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.set('to', filters.dateTo);
    }
    if (filters.search) {
      params.set('search', filters.search);
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSavedView = (view: 'week' | 'month') => {
    const now = new Date();
    
    if (view === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      setFilters({
        status: ['draft', 'in_progress'],
        dateFrom: weekAgo.toISOString().split('T')[0],
        dateTo: now.toISOString().split('T')[0],
      });
    } else if (view === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setFilters({
        status: ['final'],
        dateFrom: firstDay.toISOString().split('T')[0],
        dateTo: now.toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">דוחות בדק-בית</h1>
          <p className="text-muted-foreground mt-1">
            נהל וצור דוחות בדיקה מפורטים
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate('/inspection/new')}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          דוח חדש
        </Button>
      </div>

      {/* KPIs */}
      <InspectionKPICards data={kpis} loading={kpisLoading} />

      {/* Saved Views */}
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilters({})}>
            כל הדוחות
          </TabsTrigger>
          <TabsTrigger value="week" onClick={() => handleSavedView('week')}>
            הדוחות שלי השבוע
          </TabsTrigger>
          <TabsTrigger value="month" onClick={() => handleSavedView('month')}>
            הושלמו החודש
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0" />
        <TabsContent value="week" className="mt-0" />
        <TabsContent value="month" className="mt-0" />
      </Tabs>

      {/* Filters */}
      <InspectionFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <InspectionTable reports={reports} loading={reportsLoading} />

      {/* Floating Action Button for Mobile */}
      <Button
        size="lg"
        onClick={() => navigate('/inspection/new')}
        className="fixed bottom-6 left-6 rounded-full shadow-lg lg:hidden h-14 w-14 p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}