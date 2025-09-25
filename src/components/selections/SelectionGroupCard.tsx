import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SelectionGroupWithItems } from '@/services/selectionsService';
import { Package, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SelectionGroupCardProps {
  group: SelectionGroupWithItems;
  onManage?: () => void;
  onSendApproval?: () => void;
}

export const SelectionGroupCard = ({ group, onManage, onSendApproval }: SelectionGroupCardProps) => {
  const getStatusBadge = () => {
    if (group.approval?.approved_at) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    
    if (group.approval && !group.approval.approved_at) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending Approval
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Package className="h-3 w-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const getOverAllowanceBadge = () => {
    if (group.approval && group.approval.over_allowance_amount > 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Over Allowance ₪{group.approval.over_allowance_amount.toLocaleString()}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <div className="flex items-center">
            {getStatusBadge()}
            {getOverAllowanceBadge()}
          </div>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{group.items.length} options available</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Allowance: ₪{group.allowance_amount.toLocaleString()}</span>
          </div>
        </div>

        {group.approval && (
          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Selected Total:</span>
                <p className="font-medium">₪{group.approval.total_amount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Approved:</span>
                <p className="font-medium">
                  {group.approval.approved_at ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onManage && (
            <Button variant="outline" size="sm" onClick={onManage}>
              Manage Options
            </Button>
          )}
          {onSendApproval && !group.approval?.approved_at && (
            <Button size="sm" onClick={onSendApproval}>
              Send for Approval
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};