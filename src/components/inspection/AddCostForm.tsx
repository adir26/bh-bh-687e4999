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
    <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          הוסף עלות חדשה
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="item_id" className="text-base font-medium">ממצא *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-medium">כמות *</Label>
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
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-base font-medium">יחידת מידה</Label>
              <Input
                id="unit"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="יחידה, מ״ר, יום עבודה..."
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price" className="text-base font-medium">מחיר ליחידה (₪) *</Label>
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
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border/50 bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">סה״כ לעלות זו:</p>
              <p className="text-3xl font-bold text-primary">₪{calculatedTotal.toFixed(2)}</p>
            </div>

            <Button 
              type="submit" 
              disabled={!formData.item_id || createCost.isPending}
              size="lg"
              className="shadow-lg"
            >
              <Plus className="ml-2 h-5 w-5" />
              הוסף עלות
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
