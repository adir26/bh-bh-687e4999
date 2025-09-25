import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, Plus, Minus, Edit } from "lucide-react";
import { ChangeOrder } from "@/services/changeOrdersService";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ChangeOrderCardProps {
  changeOrder: ChangeOrder;
  showActions?: boolean;
}

const statusLabels = {
  draft: 'טיוטה',
  pending_approval: 'ממתין לאישור',
  approved: 'אושר',
  rejected: 'נדחה',
  cancelled: 'בוטל'
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  pending_approval: 'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  cancelled: 'bg-muted text-muted-foreground'
};

const getTypeIcon = (amount: number) => {
  if (amount > 0) return <Plus className="h-4 w-4 text-green-600" />;
  if (amount < 0) return <Minus className="h-4 w-4 text-red-600" />;
  return <Edit className="h-4 w-4 text-blue-600" />;
};

export function ChangeOrderCard({ changeOrder, showActions = true }: ChangeOrderCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {changeOrder.co_number}
          </CardTitle>
          <Badge className={statusColors[changeOrder.status]}>
            {statusLabels[changeOrder.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {changeOrder.title}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {getTypeIcon(changeOrder.total_amount)}
            <span className="font-medium">
              {changeOrder.total_amount >= 0 ? '+' : ''}
              ₪{Math.abs(changeOrder.total_amount).toLocaleString()}
            </span>
          </div>
          
          {changeOrder.time_delta_days !== 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {changeOrder.time_delta_days > 0 ? '+' : ''}
                {changeOrder.time_delta_days} ימים
              </span>
            </div>
          )}
        </div>

        {changeOrder.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {changeOrder.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            נוצר ב-{format(new Date(changeOrder.created_at), 'dd/MM/yyyy', { locale: he })}
          </span>
          {changeOrder.approved_at && (
            <span>
              אושר ב-{format(new Date(changeOrder.approved_at), 'dd/MM/yyyy', { locale: he })}
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/supplier/change-orders/${changeOrder.id}`)}
              className="flex-1"
            >
              <FileText className="h-4 w-4 ml-2" />
              פרטים
            </Button>
            {changeOrder.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => navigate(`/supplier/change-orders/${changeOrder.id}?edit=true`)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 ml-2" />
                עריכה
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}