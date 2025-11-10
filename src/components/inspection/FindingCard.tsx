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
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-muted/50 font-medium">{item.category}</Badge>
              {item.status_check && (
                <Badge
                  variant={statusConfig[item.status_check as keyof typeof statusConfig].variant}
                  className={`${statusConfig[item.status_check as keyof typeof statusConfig].className} shadow-sm`}
                >
                  {statusConfig[item.status_check as keyof typeof statusConfig].label}
                </Badge>
              )}
              {item.severity && item.status_check === 'not_ok' && (
                <Badge
                  className={`${severityConfig[item.severity as keyof typeof severityConfig].className} text-white shadow-sm`}
                >
                  {severityConfig[item.severity as keyof typeof severityConfig].label}
                </Badge>
              )}
            </div>

            <h3 className="font-bold text-lg md:text-xl">{item.title}</h3>

            {item.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{item.location}</span>
              </div>
            )}

            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            )}

            {item.standard_code && (
              <div className="text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg space-y-1 border border-accent/20">
                <p className="font-medium">
                  <strong className="text-accent-foreground">תקן:</strong> {item.standard_code}
                  {item.standard_clause && ` - ${item.standard_clause}`}
                </p>
                {item.standard_quote && <p className="italic text-accent-foreground/80">"{item.standard_quote}"</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
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
