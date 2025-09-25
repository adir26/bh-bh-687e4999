import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BudgetSummaryCard } from '@/components/budget/BudgetSummaryCard';
import { BudgetCategoryTable } from '@/components/budget/BudgetCategoryTable';
import { BudgetChart } from '@/components/budget/BudgetChart';
import { useBudget, useImportBudgetFromQuote, useExportBudgetCSV } from '@/hooks/useBudget';
import { FEATURES } from '@/config/featureFlags';
import { ArrowLeft, FileSpreadsheet, Download, Upload, Calculator, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderBudget() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showImportForm, setShowImportForm] = useState(false);

  const { data: budget, isLoading, error } = useBudget(orderId);
  const importFromQuoteMutation = useImportBudgetFromQuote();
  const exportCSVMutation = useExportBudgetCSV();

  if (!FEATURES.BUDGET_ENABLED) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Budget Management Coming Soon</h3>
            <p className="text-muted-foreground">
              The budget management feature is not yet available. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImportFromQuote = () => {
    if (!orderId) return;

    // Mock quote selection - in real implementation, show quote selection modal
    const mockQuoteId = 'sample-quote-id';
    const mockSupplierId = 'current-supplier-id'; // Get from auth context
    const mockClientId = 'client-id-from-order'; // Get from order data

    importFromQuoteMutation.mutate({
      orderId,
      quoteId: mockQuoteId,
      supplierId: mockSupplierId,
      clientId: mockClientId,
    });
  };

  const handleExportCSV = () => {
    if (!budget) return;

    exportCSVMutation.mutate({
      budget,
      filename: `budget-${orderId}.csv`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
              <CardContent className="h-32 bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load budget data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Budget Management</h1>
            <p className="text-muted-foreground">Track planned vs committed vs actual costs</p>
          </div>
        </div>

        <div className="flex gap-2">
          {budget && (
            <Button variant="outline" onClick={handleExportCSV} disabled={exportCSVMutation.isPending}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
          
          {!budget && (
            <Button onClick={handleImportFromQuote} disabled={importFromQuoteMutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              Import from Quote
            </Button>
          )}
        </div>
      </div>

      {budget ? (
        <div className="space-y-6">
          <BudgetSummaryCard budget={budget} />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <BudgetChart budget={budget} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budget.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {budget.transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.reference_type} • {new Date(transaction.transaction_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-mono font-medium ${
                          transaction.transaction_type === 'actual' ? 'text-green-600' :
                          transaction.transaction_type === 'committed' ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          ₪{transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <BudgetCategoryTable categories={budget.categories} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Budget Created Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a budget by importing from a quote to start tracking planned vs actual costs.
            </p>
            <Button onClick={handleImportFromQuote} disabled={importFromQuoteMutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              Import Budget from Quote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}