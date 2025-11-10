import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { InspectionKPIs } from '@/hooks/useInspectionReports';

interface InspectionKPICardsProps {
  data?: InspectionKPIs;
  loading?: boolean;
}

export function InspectionKPICards({ data, loading }: InspectionKPICardsProps) {
  const kpis = [
    {
      title: 'טיוטות',
      value: data?.draft || 0,
      icon: FileText,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      title: 'בתהליך',
      value: data?.in_progress || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'הושלמו',
      value: data?.final || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'נשלחו',
      value: data?.sent || 0,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}