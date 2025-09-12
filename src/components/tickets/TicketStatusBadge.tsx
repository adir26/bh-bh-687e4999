import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, XCircle, ArrowUp } from 'lucide-react';

interface TicketStatusBadgeProps {
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  className?: string;
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: 'Open',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          variant: 'secondary' as const,
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'escalated':
        return {
          label: 'Escalated',
          variant: 'destructive' as const,
          icon: ArrowUp,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'resolved':
        return {
          label: 'Resolved',
          variant: 'secondary' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'closed':
        return {
          label: 'Closed',
          variant: 'outline' as const,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: Clock,
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}