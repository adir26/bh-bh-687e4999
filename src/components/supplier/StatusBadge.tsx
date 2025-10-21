import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

export type OrderStatus = 
  | 'new'
  | 'waiting_for_scheduling'
  | 'measurement'
  | 'waiting_for_client_approval'
  | 'in_progress'
  | 'in_progress_preparation'
  | 'on_hold'
  | 'completed'
  | 'waiting_for_final_payment'
  | 'closed_paid_in_full'
  | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig = {
  new: {
    label: 'חדש',
    icon: AlertCircle,
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  waiting_for_scheduling: {
    label: 'בהמתנה לתיאום',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  measurement: {
    label: 'מדידה',
    icon: Package,
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  waiting_for_client_approval: {
    label: 'ממתין לאישור לקוח',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  in_progress: {
    label: 'בביצוע',
    icon: RefreshCw,
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  in_progress_preparation: {
    label: 'בביצוע - שלבי הכנה',
    icon: Package,
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  on_hold: {
    label: 'בהשהיה',
    icon: AlertCircle,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  completed: {
    label: 'הושלם',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  waiting_for_final_payment: {
    label: 'ממתין לתשלום סופי',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  closed_paid_in_full: {
    label: 'נסגר - שולם במלואו',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  cancelled: {
    label: 'בוטל',
    icon: X,
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, 'gap-1', className)}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export function getStatusConfig(status: OrderStatus) {
  return statusConfig[status];
}

export function getActiveStatuses(): OrderStatus[] {
  return ['new', 'waiting_for_scheduling', 'measurement', 'waiting_for_client_approval', 'in_progress', 'in_progress_preparation', 'on_hold'];
}

export function getClosedStatuses(): OrderStatus[] {
  return ['completed', 'waiting_for_final_payment', 'closed_paid_in_full', 'cancelled'];
}