import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaUpdate } from '@/lib/supaFetch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const { data: report, isLoading, isError, error, refetch } = useQuery({
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
    <PageBoundary isLoading={isLoading} isError={isError} error={error as any} onRetry={() => refetch()}>
      {!report ? (
        <div className="container max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">דוח לא נמצא</h1>
          <Button onClick={() => navigate('/inspection/dashboard')}>
            חזרה לדשבורד
          </Button>
        </div>
      ) : (
        <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-xl">
            <div className="relative z-10">
              <Button
                variant="ghost"
                onClick={() => navigate('/inspection/dashboard')}
                className="mb-4 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                חזרה לדשבורד
              </Button>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="p-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">
                    {reportTypeLabels[report.report_type] || report.report_type}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                      גרסה {report.version}
                    </Badge>
                    <p className="text-sm text-primary-foreground/80">
                      דוח #{report.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" dir="rtl" className="w-full">
            <div className="overflow-x-auto scrollbar-hide mb-6">
              <TabsList className="inline-flex w-full min-w-max bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">פרטים</TabsTrigger>
                <TabsTrigger value="findings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">ממצאים</TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">מדיה</TabsTrigger>
                <TabsTrigger value="costs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">עלויות</TabsTrigger>
                <TabsTrigger value="template" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">תבנית</TabsTrigger>
                <TabsTrigger value="signatures" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">חתימות & PDF</TabsTrigger>
                <TabsTrigger value="sharing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">שיתוף</TabsTrigger>
              </TabsList>
            </div>

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
      )}
    </PageBoundary>
  );
}
