import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportMediaTabProps {
  reportId: string;
}

export default function ReportMediaTab({ reportId }: ReportMediaTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>מדיה</CardTitle>
        <CardDescription>ניהול תמונות וסרטונים ברמת הדוח (בפיתוח)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">תכונה בפיתוח</p>
      </CardContent>
    </Card>
  );
}
