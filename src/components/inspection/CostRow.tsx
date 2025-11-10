import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Save, X, Trash2, Pencil } from 'lucide-react';
import { useUpdateInspectionCost, useDeleteInspectionCost } from '@/hooks/useInspectionCosts';
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

interface CostRowProps {
  cost: any;
  itemTitle: string;
}

export default function CostRow({ cost, itemTitle }: CostRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    quantity: cost.quantity,
    unit: cost.unit,
    unit_price: cost.unit_price,
  });

  const updateCost = useUpdateInspectionCost();
  const deleteCost = useDeleteInspectionCost();

  useEffect(() => {
    setFormData({
      quantity: cost.quantity,
      unit: cost.unit,
      unit_price: cost.unit_price,
    });
  }, [cost]);

  const handleSave = () => {
    updateCost.mutate({
      id: cost.id,
      itemId: cost.item_id,
      ...formData,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      quantity: cost.quantity,
      unit: cost.unit,
      unit_price: cost.unit_price,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteCost.mutate({
      id: cost.id,
      itemId: cost.item_id,
    });
  };

  const calculatedTotal = formData.quantity * formData.unit_price;

  if (isEditing) {
    return (
      <TableRow>
        <TableCell className="font-medium">{itemTitle}</TableCell>
        <TableCell>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            className="w-24"
            min="0"
            step="0.01"
          />
        </TableCell>
        <TableCell>
          <Input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-28"
            placeholder="יחידה"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
            className="w-32"
            min="0"
            step="0.01"
          />
        </TableCell>
        <TableCell className="font-medium">
          ₪{calculatedTotal.toFixed(2)}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{itemTitle}</TableCell>
      <TableCell>{cost.quantity}</TableCell>
      <TableCell>{cost.unit}</TableCell>
      <TableCell>₪{cost.unit_price.toFixed(2)}</TableCell>
      <TableCell className="font-medium">₪{cost.total.toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-[120]">
              <AlertDialogHeader>
                <AlertDialogTitle>מחיקת עלות</AlertDialogTitle>
                <AlertDialogDescription>
                  האם אתה בטוח שברצונך למחוק עלות זו?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
