import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Share2, MoreHorizontal, Edit, Trash2, Archive } from 'lucide-react';
import { MoodBoard } from '@/services/moodBoardService';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface MoodBoardCardProps {
  moodBoard: MoodBoard;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (token: string) => void;
  onDelete: (id: string) => void;
}

const statusLabels = {
  draft: 'טיוטה',
  shared: 'משותף',
  approved: 'מאושר',
  archived: 'בארכיון'
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  shared: 'bg-primary text-primary-foreground',
  approved: 'bg-success text-success-foreground',
  archived: 'bg-muted text-muted-foreground'
};

export function MoodBoardCard({ moodBoard, onView, onEdit, onShare, onDelete }: MoodBoardCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{moodBoard.title}</CardTitle>
            {moodBoard.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{moodBoard.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(moodBoard.id)}>
                <Edit className="h-4 w-4 mr-2" />
                עריכה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(moodBoard.share_token)}>
                <Share2 className="h-4 w-4 mr-2" />
                שיתוף
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(moodBoard.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                מחיקה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={statusColors[moodBoard.status]}>
            {statusLabels[moodBoard.status]}
          </Badge>
          {!moodBoard.is_active && (
            <Badge variant="outline">
              <Archive className="h-3 w-3 mr-1" />
              לא פעיל
            </Badge>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>נוצר {formatDistanceToNow(new Date(moodBoard.created_at), { addSuffix: true, locale: he })}</p>
          {moodBoard.updated_at !== moodBoard.created_at && (
            <p>עודכן {formatDistanceToNow(new Date(moodBoard.updated_at), { addSuffix: true, locale: he })}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 w-full">
          <Button onClick={() => onView(moodBoard.id)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            צפייה
          </Button>
          {moodBoard.status === 'shared' && (
            <Button variant="outline" onClick={() => onShare(moodBoard.share_token)}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}