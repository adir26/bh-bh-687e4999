import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BudgetWithCategories } from '@/services/budgetService';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

interface BudgetSummaryCardProps {
  budget: BudgetWithCategories;
}

export const BudgetSummaryCard = ({ budget }: BudgetSummaryCardProps) => {
  const variancePercentage = budget.total_planned > 0 
    ? ((budget.variance / budget.total_planned) * 100).toFixed(2)
    : '0';

  const getVarianceBadge = () => {
    const isOverBudget = budget.variance > 0;
    const isSignificant = Math.abs(parseFloat(variancePercentage)) >= 5;

    if (isOverBudget && isSignificant) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Over Budget ({variancePercentage}%)
        </Badge>
      );
    }

    if (!isOverBudget && isSignificant) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
          <TrendingDown className="h-3 w-3" />
          Under Budget ({Math.abs(parseFloat(variancePercentage))}%)
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        On Track
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Budget Summary</CardTitle>
          {getVarianceBadge()}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-muted-foreground">Planned</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ₪{budget.total_planned.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm text-muted-foreground">Committed</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ₪{budget.total_committed.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-muted-foreground">Actual</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₪{budget.total_actual.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {budget.variance > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-sm text-muted-foreground">Variance</span>
            </div>
            <div className={`text-2xl font-bold ${
              budget.variance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {budget.variance > 0 ? '+' : ''}₪{budget.variance.toLocaleString()}
            </div>
          </div>
        </div>

        {budget.imported_from_quote_id && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Imported from quote on {new Date(budget.imported_at!).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};