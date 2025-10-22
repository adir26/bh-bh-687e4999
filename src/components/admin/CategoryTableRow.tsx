import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, Edit, Trash2, MoreHorizontal, Eye, Tag } from "lucide-react";
import { EnhancedCategory } from '@/types/admin';

interface CategoryTableRowProps {
  category: EnhancedCategory;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: (category: EnhancedCategory) => void;
  onDelete: (category: EnhancedCategory) => void;
  onReorder: (category: EnhancedCategory, direction: 'up' | 'down') => void;
  onToggleStatus: (category: EnhancedCategory) => void;
  onToggleVisibility: (category: EnhancedCategory) => void;
}

export function CategoryTableRow({
  category,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onReorder,
  onToggleStatus,
  onToggleVisibility
}: CategoryTableRowProps) {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">פעיל</Badge>
    ) : (
      <Badge variant="destructive">לא פעיל</Badge>
    );
  };

  const getVisibilityBadge = (isPublic: boolean) => {
    return isPublic ? (
      <Badge variant="outline">ציבורי</Badge>
    ) : (
      <Badge variant="secondary">מוסתר</Badge>
    );
  };

  return (
    <TableRow>
      <TableCell className="text-right">
        <div className="flex items-center gap-2">
          {category.icon && <Tag className="h-4 w-4" />}
          <span className="font-medium">{category.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {category.description || '-'}
        </div>
      </TableCell>
      <TableCell className="text-center">
        {category.supplier_count || 0}
      </TableCell>
      <TableCell className="text-center">
        {category.product_count || 0}
      </TableCell>
      <TableCell className="text-center">
        {getStatusBadge(category.is_active)}
      </TableCell>
      <TableCell className="text-center">
        {getVisibilityBadge(category.is_public)}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReorder(category, 'up')}
            disabled={!canMoveUp}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReorder(category, 'down')}
            disabled={!canMoveDown}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-left">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-hebrew">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="h-4 w-4 ml-2" />
              עריכה
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(category)}>
              <Eye className="h-4 w-4 ml-2" />
              {category.is_active ? 'השבתה' : 'הפעלה'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleVisibility(category)}>
              <Eye className="h-4 w-4 ml-2" />
              {category.is_public ? 'הסתרה' : 'פרסום'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(category)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              מחיקה
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
