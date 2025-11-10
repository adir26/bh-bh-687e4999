import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, MapPin, User, FileText } from 'lucide-react';
import { PageBoundary } from '@/components/system/PageBoundary';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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

export default function PublicInspectionReport() {
  const { id } = useParams<{ id: string }>();

  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ['public-inspection-report', id],
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

  const statusLabels: Record<string, string> = {
    draft: 'טיוטה',
    in_progress: 'בתהליך',
    final: 'סופי',
    sent: 'נשלח',
  };

  return (
    <PageBoundary isLoading={isLoading} isError={isError} error={error as any}>
      {!report ? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">דוח לא נמצא</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              הדוח שחיפשתם אינו זמין או שהוסר.
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="container max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">
                  {reportTypeLabels[report.report_type] || report.report_type}
                </h1>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={report.status === 'final' || report.status === 'sent' ? 'default' : 'secondary'}>
                  {statusLabels[report.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">גרסה {report.version}</span>
              </div>
            </div>

            {/* Report Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>פרטי הדוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.project_name && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">שם הפרויקט</div>
                      <div className="font-medium">{report.project_name}</div>
                    </div>
                  </div>
                )}

                {report.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">כתובת</div>
                      <div className="font-medium">{report.address}</div>
                    </div>
                  </div>
                )}

                {report.inspection_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">תאריך בדיקה</div>
                      <div className="font-medium">
                        {format(new Date(report.inspection_date), 'dd MMMM yyyy', { locale: he })}
                      </div>
                    </div>
                  </div>
                )}

                {report.inspector_name && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">בודק</div>
                      <div className="font-medium">{report.inspector_name}</div>
                    </div>
                  </div>
                )}

                {report.notes && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">הערות</div>
                    <div className="text-sm">{report.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download Section */}
            {report.pdf_url && (
              <Card>
                <CardHeader>
                  <CardTitle>הורדת הדוח</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => window.open(report.pdf_url, '_blank')}
                  >
                    <Download className="ml-2 h-5 w-5" />
                    הורדת PDF
                  </Button>
                </CardContent>
              </Card>
            )}

            {!report.pdf_url && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  קובץ PDF של הדוח עדיין לא זמין.
                  <br />
                  אנא פנו לבודק לקבלת הדוח.
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>דוח זה נוצר באמצעות מערכת ניהול דוחות בדיקה</p>
            </div>
          </div>
        </div>
      )}
    </PageBoundary>
  );
}
