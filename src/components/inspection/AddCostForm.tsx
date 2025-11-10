import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateInspectionCost } from '@/hooks/useInspectionCosts';

interface AddCostFormProps {
  items: any[];
}

export default function AddCostForm({ items }: AddCostFormProps) {
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    unit: 'יחידה',
    unit_price: 0,
  });

  const createCost = useCreateInspectionCost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_id) return;

    createCost.mutate(formData, {
      onSuccess: () => {
        setFormData({
          item_id: '',
          quantity: 1,
          unit: 'יחידה',
          unit_price: 0,
        });
      },
    });
  };

  const calculatedTotal = formData.quantity * formData.unit_price;

  return (
    <Card>
      <CardHeader>
        <CardTitle>הוסף עלות חדשה</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_id">ממצא *</Label>
              <Select
                value={formData.item_id}
                onValueChange={(value) => setFormData({ ...formData, item_id: value })}
                required
              >
                <SelectTrigger id="item_id">
                  <SelectValue placeholder="בחר ממצא" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">כמות *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
                }
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">יחידת מידה</Label>
              <Input
                id="unit"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="יחידה, מ״ר, יום עבודה..."
              />
            </div>

            <div>
              <Label htmlFor="unit_price">מחיר ליחידה (₪) *</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
                }
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">סה״כ לעלות זו:</p>
              <p className="text-2xl font-bold">₪{calculatedTotal.toFixed(2)}</p>
            </div>

            <Button type="submit" disabled={!formData.item_id || createCost.isPending}>
              <Plus className="ml-2 h-4 w-4" />
              הוסף עלות
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
