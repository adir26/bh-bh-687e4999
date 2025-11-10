import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInspectionItems } from '@/hooks/useInspectionItems';
import { useInspectionCosts } from '@/hooks/useInspectionCosts';
import { Loader2, DollarSign } from 'lucide-react';
import CostRow from './CostRow';
import AddCostForm from './AddCostForm';

interface ReportCostsTabProps {
  reportId: string;
}

export default function ReportCostsTab({ reportId }: ReportCostsTabProps) {
  const { data: items = [], isLoading: itemsLoading } = useInspectionItems(reportId);
  const { data: costs = [], isLoading: costsLoading } = useInspectionCosts(reportId);

  const isLoading = itemsLoading || costsLoading;

  // Group costs by item
  const costsByItem = costs.reduce((acc, cost) => {
    if (!acc[cost.item_id]) {
      acc[cost.item_id] = [];
    }
    acc[cost.item_id].push(cost);
    return acc;
  }, {} as Record<string, typeof costs>);

  // Calculate totals
  const grandTotal = costs.reduce((sum, cost) => sum + cost.total, 0);
  const totalItems = Object.keys(costsByItem).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>עלויות</CardTitle>
              <CardDescription>ניהול עלויות תיקון לממצאים</CardDescription>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">סה״כ כולל</p>
              <p className="text-3xl font-bold">₪{grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{costs.length}</p>
              <p className="text-sm text-muted-foreground">עלויות</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-sm text-muted-foreground">ממצאים עם עלויות</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                ₪{costs.length > 0 ? (grandTotal / costs.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">ממוצע לעלות</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Cost Form */}
      {items.length > 0 && <AddCostForm items={items} />}

      {/* Costs Table */}
      {costs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>פירוט עלויות</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ממצא</TableHead>
                  <TableHead>כמות</TableHead>
                  <TableHead>יחידה</TableHead>
                  <TableHead>מחיר ליחידה</TableHead>
                  <TableHead>סה״כ</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => {
                  const item = items.find((i) => i.id === cost.item_id);
                  return (
                    <CostRow
                      key={cost.id}
                      cost={cost}
                      itemTitle={item?.title || 'ממצא לא ידוע'}
                    />
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-left font-bold">
                    סה״כ כולל
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    ₪{grandTotal.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">אין ממצאים בדוח</p>
            <p className="text-sm text-muted-foreground">
              הוסף ממצאים בטאב "ממצאים" כדי להוסיף עלויות
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center p-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">אין עלויות בדוח</p>
            <p className="text-sm text-muted-foreground">
              השתמש בטופס למעלה להוספת עלות חדשה
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
