import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, AlertCircle } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { InspectionReportPreview } from '@/components/inspection/InspectionReportPreview';
import { showToast } from '@/utils/toast';
import { downloadInspectionPdf } from '@/services/inspectionPdfService';

export default function PublicInspectionReport() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-inspection-report', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing report ID');

      // Fetch report
      const reportRes = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (reportRes.error) throw reportRes.error;
      if (!reportRes.data) throw new Error('Report not found');

      // Fetch findings
      const findingsRes = await supabase
        .from('inspection_items')
        .select('*')
        .eq('report_id', id)
        .order('created_at');

      if (findingsRes.error) throw findingsRes.error;

      // Fetch costs for all findings in this report
      const findingIds = (findingsRes.data || []).map(f => f.id);
      let mappedCosts: any[] = [];
      
      if (findingIds.length > 0) {
        const costsRes = await supabase
          .from('inspection_costs')
          .select('*')
          .in('item_id', findingIds);

        if (costsRes.error) throw costsRes.error;

        // Map costs to match expected format
        mappedCosts = (costsRes.data || []).map((cost: any) => ({
          ...cost,
          total_price: cost.total || cost.total_price,
        }));
      }

      return {
        report: reportRes.data,
        findings: findingsRes.data || [],
        costs: mappedCosts,
      };
    },
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      await downloadInspectionPdf(
        id,
        data?.report?.template as 'classic' | 'modern' | 'elegant' | 'premium' || 'classic',
        !!data?.report?.signature_data
      );
      showToast.success('ה-PDF הורד בהצלחה');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showToast.error('שגיאה בהורדת ה-PDF');
    }
  };

  return (
    <PageBoundary isLoading={isLoading} isError={isError} error={error as any}>
      {!data?.report ? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                דוח לא נמצא
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              הדוח שחיפשתם אינו זמין או שהוסר.
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-8">
          <div className="container max-w-5xl mx-auto px-4 space-y-6">
            {/* Title Banner */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  דוח בדיקה מקצועי
                </CardTitle>
                <p className="text-primary-foreground/80">
                  צפייה ציבורית בדוח
                </p>
              </CardHeader>
            </Card>

            {/* Report Preview */}
            <InspectionReportPreview
              report={data.report}
              findings={data.findings}
              costs={data.costs}
              signature={data.report.signature_data}
              template={data.report.template || 'classic'}
              logoUrl={data.report.logo_url}
            />

            {/* Download Actions */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">פעולות</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownloadPdf}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Download className="h-5 w-5" />
                    הורד דוח כ-PDF
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  ניתן להוריד את הדוח המלא בפורמט PDF לשמירה והדפסה
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 p-6 rounded-xl bg-muted/20 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground">
                דוח זה נוצר באמצעות מערכת ניהול דוחות בדיקה מקצועית
              </p>
            </div>
          </div>
        </div>
      )}
    </PageBoundary>
  );
}
