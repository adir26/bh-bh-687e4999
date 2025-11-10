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
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg">
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold">
                    {reportTypeLabels[report.report_type] || report.report_type}
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Badge 
                    variant={report.status === 'final' || report.status === 'sent' ? 'default' : 'secondary'}
                    className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                  >
                    {statusLabels[report.status]}
                  </Badge>
                  <span className="text-sm text-primary-foreground/90 font-medium">גרסה {report.version}</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
            </div>

            {/* Report Details */}
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  פרטי הדוח
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {report.project_name && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-accent/20 hover:bg-accent/40 transition-colors">
                    <div className="p-2 rounded-lg bg-accent/50">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-1">שם הפרויקט</div>
                      <div className="font-semibold text-lg">{report.project_name}</div>
                    </div>
                  </div>
                )}

                {report.address && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <MapPin className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-1">כתובת</div>
                      <div className="font-semibold text-lg">{report.address}</div>
                    </div>
                  </div>
                )}

                {report.inspection_date && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-1">תאריך בדיקה</div>
                      <div className="font-semibold text-lg">
                        {format(new Date(report.inspection_date), 'dd MMMM yyyy', { locale: he })}
                      </div>
                    </div>
                  </div>
                )}

                {report.inspector_name && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-muted hover:bg-muted/70 transition-colors">
                    <div className="p-2 rounded-lg bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-muted-foreground mb-1">בודק</div>
                      <div className="font-semibold text-lg">{report.inspector_name}</div>
                    </div>
                  </div>
                )}

                {report.notes && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                    <div className="text-xs font-medium text-muted-foreground mb-2">הערות</div>
                    <div className="text-sm leading-relaxed">{report.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download Section */}
            {report.pdf_url && (
              <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Download className="h-6 w-6" />
                    הורדת הדוח
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
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
              <Card className="border-none shadow-lg bg-muted/30 backdrop-blur-sm">
                <CardContent className="py-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    קובץ PDF של הדוח עדיין לא זמין.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    אנא פנו לבודק לקבלת הדוח.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="mt-8 p-6 rounded-xl bg-muted/20 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground">
                דוח זה נוצר באמצעות מערכת ניהול דוחות בדיקה מתקדמת
              </p>
            </div>
          </div>
        </div>
      )}
    </PageBoundary>
  );
}
