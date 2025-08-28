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
  | 'pending' 
  | 'confirmed' 
  | 'in_production' 
  | 'ready' 
  | 'shipped' 
  | 'delivered' 
  | 'canceled' 
  | 'refunded';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'ממתין לאישור',
    icon: AlertCircle,
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  confirmed: {
    label: 'אושר',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  in_production: {
    label: 'בייצור',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  ready: {
    label: 'מוכן למשלוח',
    icon: Package,
    variant: 'secondary' as const,
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  shipped: {
    label: 'נשלח',
    icon: Truck,
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  delivered: {
    label: 'נמסר',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  canceled: {
    label: 'בוטל',
    icon: X,
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  refunded: {
    label: 'הוחזר',
    icon: RefreshCw,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200'
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
  return ['pending', 'confirmed', 'in_production', 'ready', 'shipped'];
}

export function getClosedStatuses(): OrderStatus[] {
  return ['delivered', 'canceled', 'refunded'];
}