import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportTemplateTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

export default function ReportTemplateTab({ report, onUpdate }: ReportTemplateTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>תבנית ומיתוג</CardTitle>
        <CardDescription>עיצוב והתאמת התבנית (בפיתוח)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">תכונה בפיתוח</p>
      </CardContent>
    </Card>
  );
}
