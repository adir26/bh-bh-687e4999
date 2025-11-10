import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportSignaturesTabProps {
  report: any;
  onUpdate: (updates: any) => void;
}

export default function ReportSignaturesTab({ report, onUpdate }: ReportSignaturesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>חתימות והפקת PDF</CardTitle>
        <CardDescription>חתימות ויצירת PDF (בפיתוח)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">תכונה בפיתוח</p>
      </CardContent>
    </Card>
  );
}
