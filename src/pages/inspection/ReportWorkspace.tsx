import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaUpdate } from '@/lib/supaFetch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ArrowRight, Save, FileText } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { toast } from 'sonner';
import ReportDetailsTab from '@/components/inspection/ReportDetailsTab';
import ReportFindingsTab from '@/components/inspection/ReportFindingsTab';
import ReportMediaTab from '@/components/inspection/ReportMediaTab';
import ReportCostsTab from '@/components/inspection/ReportCostsTab';
import ReportTemplateTab from '@/components/inspection/ReportTemplateTab';
import ReportSignaturesTab from '@/components/inspection/ReportSignaturesTab';
import ReportSharingTab from '@/components/inspection/ReportSharingTab';

interface InspectionReport {
  id: string;
  report_type: string;
  status: string;
  version: number;
  project_name?: string;
  address?: string;
  inspection_date?: string;
  inspector_name?: string;
  notes?: string;
  pdf_url?: string;
}

export default function ReportWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useQuery({
    queryKey: ['inspection-report', id],
    queryFn: async ({ signal }) => {
      const query = supabase
        .from('inspection_reports')
        .select('*')
        .eq('id', id)
        .single();

      return await supaSelect<InspectionReport>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת דוח',
      });
    },
    enabled: !!id,
  });

  const updateReport = useMutation({
    mutationFn: async (updates: Partial<InspectionReport>) => {
      const query = supabase
        .from('inspection_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return await supaUpdate<InspectionReport>(query, {
        errorMessage: 'שגיאה בעדכון דוח',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-report', id] });
      toast.success('הדוח נשמר בהצלחה');
    },
  });

  if (isLoading) {
    return (
      <PageBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageBoundary>
    );
  }

  if (!report) {
    return (
      <PageBoundary>
        <div className="container max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">דוח לא נמצא</h1>
          <Button onClick={() => navigate('/inspection/dashboard')}>
            חזרה לדשבורד
          </Button>
        </div>
      </PageBoundary>
    );
  }

  const reportTypeLabels: Record<string, string> = {
    home_inspection: 'בדק בית',
    plumbing: 'אינסטלציה',
    supervision: 'פיקוח',
    leak_detection: 'איתור נזילות',
    qa: 'בקרת איכות',
    safety: 'בטיחות',
    consultants: 'יועצים',
    handover: 'מסירות דירות',
    common_areas: 'שטחים ציבוריים',
  };

  return (
    <PageBoundary>
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/inspection/dashboard')}
              className="mb-2"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה לדשבורד
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">
              {reportTypeLabels[report.report_type] || report.report_type} - גרסה {report.version}
            </h1>
            <p className="text-sm text-muted-foreground">
              דוח #{report.id.substring(0, 8)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="details">פרטים</TabsTrigger>
            <TabsTrigger value="findings">ממצאים</TabsTrigger>
            <TabsTrigger value="media">מדיה</TabsTrigger>
            <TabsTrigger value="costs">עלויות</TabsTrigger>
            <TabsTrigger value="template">תבנית</TabsTrigger>
            <TabsTrigger value="signatures">חתימות & PDF</TabsTrigger>
            <TabsTrigger value="sharing">שיתוף</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ReportDetailsTab report={report} onUpdate={updateReport.mutate} />
          </TabsContent>

          <TabsContent value="findings">
            <ReportFindingsTab reportId={report.id} />
          </TabsContent>

          <TabsContent value="media">
            <ReportMediaTab reportId={report.id} />
          </TabsContent>

          <TabsContent value="costs">
            <ReportCostsTab reportId={report.id} />
          </TabsContent>

          <TabsContent value="template">
            <ReportTemplateTab report={report} onUpdate={updateReport.mutate} />
          </TabsContent>

          <TabsContent value="signatures">
            <ReportSignaturesTab report={report} onUpdate={updateReport.mutate} />
          </TabsContent>

          <TabsContent value="sharing">
            <ReportSharingTab report={report} />
          </TabsContent>
        </Tabs>
      </div>
    </PageBoundary>
  );
}
