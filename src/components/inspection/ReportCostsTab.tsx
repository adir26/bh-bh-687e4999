import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportCostsTabProps {
  reportId: string;
}

export default function ReportCostsTab({ reportId }: ReportCostsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>עלויות</CardTitle>
        <CardDescription>ניהול עלויות לממצאים (בפיתוח)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">תכונה בפיתוח</p>
      </CardContent>
    </Card>
  );
}
