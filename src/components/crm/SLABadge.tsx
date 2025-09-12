import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { Lead } from '@/services/leadsService';

interface SLABadgeProps {
  lead: Lead;
}

export function SLABadge({ lead }: SLABadgeProps) {
  // Check if lead is at SLA risk
  const isSLARisk = lead.sla_risk || (
    lead.status === 'new' && 
    lead.created_at &&
    new Date(lead.created_at).getTime() < Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
  );

  const isSnoozed = lead.snoozed_until && new Date(lead.snoozed_until) > new Date();

  if (isSnoozed) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Snoozed
      </Badge>
    );
  }

  if (isSLARisk) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        SLA Risk
      </Badge>
    );
  }

  return null;
}