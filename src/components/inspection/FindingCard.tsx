import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { useDeleteInspectionItem } from '@/hooks/useInspectionItems';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FindingCardProps {
  item: any;
  reportId: string;
  onEdit: () => void;
}

const statusConfig = {
  ok: { label: 'תקין', variant: 'default' as const, className: 'bg-green-500' },
  not_ok: { label: 'לא תקין', variant: 'destructive' as const, className: '' },
  na: { label: 'לא נבדק', variant: 'secondary' as const, className: '' },
};

const severityConfig = {
  low: { label: 'נמוכה', className: 'bg-blue-500' },
  medium: { label: 'בינונית', className: 'bg-yellow-500' },
  high: { label: 'גבוהה', className: 'bg-red-500' },
};

export default function FindingCard({ item, reportId, onEdit }: FindingCardProps) {
  const deleteItem = useDeleteInspectionItem();

  const handleDelete = () => {
    deleteItem.mutate({ id: item.id, reportId });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{item.category}</Badge>
              {item.status_check && (
                <Badge
                  variant={statusConfig[item.status_check as keyof typeof statusConfig].variant}
                  className={statusConfig[item.status_check as keyof typeof statusConfig].className}
                >
                  {statusConfig[item.status_check as keyof typeof statusConfig].label}
                </Badge>
              )}
              {item.severity && item.status_check === 'not_ok' && (
                <Badge
                  className={severityConfig[item.severity as keyof typeof severityConfig].className}
                >
                  {severityConfig[item.severity as keyof typeof severityConfig].label}
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>

            {item.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3" />
                {item.location}
              </p>
            )}

            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            )}

            {item.standard_code && (
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <p>
                  <strong>תקן:</strong> {item.standard_code}
                  {item.standard_clause && ` - ${item.standard_clause}`}
                </p>
                {item.standard_quote && <p className="italic">"{item.standard_quote}"</p>}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[120]">
                <AlertDialogHeader>
                  <AlertDialogTitle>מחיקת ממצא</AlertDialogTitle>
                  <AlertDialogDescription>
                    האם אתה בטוח שברצונך למחוק ממצא זה? פעולה זו לא ניתנת לביטול.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
