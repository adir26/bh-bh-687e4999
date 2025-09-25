import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, ShoppingCart, Star } from 'lucide-react';
import { type MoodBoardItem, type MoodBoardReaction } from '@/services/moodBoardService';
import { cn } from '@/lib/utils';

interface MoodBoardItemProps {
  item: MoodBoardItem;
  reactions: MoodBoardReaction[];
  commentsCount: number;
  isPublic?: boolean;
  canEdit?: boolean;
  onReact?: (itemId: string, type: 'like' | 'love') => void;
  onComment?: (itemId: string) => void;
  onEdit?: (item: MoodBoardItem) => void;
  onDelete?: (itemId: string) => void;
  onAddToSelections?: (itemId: string) => void;
  className?: string;
}

export function MoodBoardItem({ 
  item, 
  reactions, 
  commentsCount, 
  isPublic = false,
  canEdit = false,
  onReact,
  onComment,
  onEdit,
  onDelete,
  onAddToSelections,
  className 
}: MoodBoardItemProps) {
  const likesCount = reactions.filter(r => r.reaction_type === 'like').length;
  const lovesCount = reactions.filter(r => r.reaction_type === 'love').length;

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200", className)}>
      <div className="relative">
        <img 
          src={item.image_url} 
          alt={item.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {item.is_featured && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
            <Star className="h-3 w-3 mr-1" />
            מומלץ
          </Badge>
        )}
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(item)}>
                <Edit className="h-4 w-4 mr-2" />
                עריכה
              </DropdownMenuItem>
              {onAddToSelections && (
                <DropdownMenuItem onClick={() => onAddToSelections(item.id)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  הוסף לבחירות
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(item.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                מחיקה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-base line-clamp-1">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          )}
          
          {item.price && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                ₪{item.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">{item.currency}</span>
            </div>
          )}

          {/* Reactions and Comments */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              {!isPublic && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact?.(item.id, 'like')}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {likesCount}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComment?.(item.id)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {commentsCount}
                  </Button>
                </>
              )}
              {isPublic && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {likesCount + lovesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {commentsCount}
                  </span>
                </div>
              )}
            </div>
            
            {item.supplier_notes && (
              <Badge variant="outline" className="text-xs">
                הערות ספק
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}