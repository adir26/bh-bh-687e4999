import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BudgetCategory } from '@/services/budgetService';
import { useUpdateBudgetCategory } from '@/hooks/useBudget';
import { Edit, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BudgetCategoryTableProps {
  categories: BudgetCategory[];
}

export const BudgetCategoryTable = ({ categories }: BudgetCategoryTableProps) => {
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editForm, setEditForm] = useState({
    planned_amount: 0,
    committed_amount: 0,
    actual_amount: 0,
  });

  const updateCategoryMutation = useUpdateBudgetCategory();

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setEditForm({
      planned_amount: category.planned_amount,
      committed_amount: category.committed_amount,
      actual_amount: category.actual_amount,
    });
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;

    updateCategoryMutation.mutate({
      id: editingCategory.id,
      data: editForm,
    }, {
      onSuccess: () => {
        setEditingCategory(null);
      }
    });
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getVarianceBadge = (variance: number, percentage: number) => {
    if (Math.abs(percentage) < 5) {
      return <Badge variant="outline">On Track</Badge>;
    }

    if (variance > 0) {
      return (
        <Badge variant="destructive">
          Over +{percentage.toFixed(1)}%
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Under {percentage.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Categories</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-right py-3 px-4 font-medium">Planned</th>
                <th className="text-right py-3 px-4 font-medium">Committed</th>
                <th className="text-right py-3 px-4 font-medium">Actual</th>
                <th className="text-right py-3 px-4 font-medium">Variance</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-muted/50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-mono">
                    ₪{category.planned_amount.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-mono">
                    ₪{category.committed_amount.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 font-mono">
                    ₪{category.actual_amount.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {getVarianceIcon(category.variance_amount)}
                      <span className={`font-mono ${
                        category.variance_amount > 0 ? 'text-red-600' : 
                        category.variance_amount < 0 ? 'text-green-600' : 
                        'text-muted-foreground'
                      }`}>
                        {category.variance_amount > 0 ? '+' : ''}₪{category.variance_amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    {getVarianceBadge(category.variance_amount, category.variance_percentage)}
                  </td>
                  <td className="text-center py-4 px-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {category.name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="planned">Planned Amount (₪)</Label>
                            <Input
                              id="planned"
                              type="number"
                              value={editForm.planned_amount}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                planned_amount: Number(e.target.value)
                              }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="committed">Committed Amount (₪)</Label>
                            <Input
                              id="committed"
                              type="number"
                              value={editForm.committed_amount}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                committed_amount: Number(e.target.value)
                              }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="actual">Actual Amount (₪)</Label>
                            <Input
                              id="actual"
                              type="number"
                              value={editForm.actual_amount}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                actual_amount: Number(e.target.value)
                              }))}
                            />
                          </div>
                          
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handleSaveCategory}
                              disabled={updateCategoryMutation.isPending}
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingCategory(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};