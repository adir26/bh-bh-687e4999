import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSLAMetrics } from '@/hooks/useSLAMetrics';
import { Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface SLAMetricsWidgetProps {
  supplierId?: string;
}

export function SLAMetricsWidget({ supplierId }: SLAMetricsWidgetProps) {
  const { data: metrics, isLoading } = useSLAMetrics(supplierId);

  if (!supplierId || isLoading || !metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avg_response_time_hours.toFixed(1)}h
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.response_rate_percent}%
          </div>
          <p className="text-xs text-muted-foreground">
            Leads responded to
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.sla_compliant_percent}%
          </div>
          <p className="text-xs text-muted-foreground">
            Within 2 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}