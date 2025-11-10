import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportSharingTabProps {
  report: any;
}

export default function ReportSharingTab({ report }: ReportSharingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>שיתוף</CardTitle>
        <CardDescription>שליחה באמצעות WhatsApp ואימייל (בפיתוח)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">תכונה בפיתוח</p>
      </CardContent>
    </Card>
  );
}
