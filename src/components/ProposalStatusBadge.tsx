import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, CheckCircle, XCircle } from 'lucide-react';

interface ProposalStatusBadgeProps {
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  className?: string;
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'טיוטה',
          variant: 'secondary' as const,
          icon: FileText,
          className: 'bg-gray-100 text-gray-800'
        };
      case 'sent':
        return {
          label: 'נשלח',
          variant: 'default' as const,
          icon: Send,
          className: 'bg-blue-100 text-blue-800'
        };
      case 'accepted':
        return {
          label: 'אושר',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800'
        };
      case 'rejected':
        return {
          label: 'נדחה',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: FileText,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      <Icon className="w-3 h-3 ml-1" />
      {config.label}
    </Badge>
  );
};