import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaSelectMaybe, supaInsert, supaUpdate } from '@/lib/supaFetch';

export interface Budget {
  id: string;
  order_id: string;
  supplier_id: string;
  client_id: string;
  total_planned: number;
  total_committed: number;
  total_actual: number;
  variance: number;
  imported_from_quote_id?: string;
  imported_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  name: string;
  description?: string;
  planned_amount: number;
  committed_amount: number;
  actual_amount: number;
  variance_amount: number;
  variance_percentage: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetTransaction {
  id: string;
  budget_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  description?: string;
  reference_type: 'quote' | 'change_order' | 'payment' | 'manual';
  reference_id?: string;
  created_by?: string;
  created_at: string;
  transaction_type: 'planned' | 'committed' | 'actual';
}

export interface BudgetWithCategories extends Budget {
  categories: BudgetCategory[];
  transactions: BudgetTransaction[];
}

// Budget CRUD operations
export const getBudgetForOrder = async (orderId: string): Promise<BudgetWithCategories | null> => {
  const budget = await supaSelectMaybe<Budget>(
    supabase
      .from('budgets')
      .select('*')
      .eq('order_id', orderId),
    { errorMessage: 'Error fetching budget' }
  );

  if (!budget) return null;

  const [categories, transactions] = await Promise.all([
    getBudgetCategories(budget.id),
    getBudgetTransactions(budget.id)
  ]);

  return {
    ...budget,
    categories,
    transactions
  };
};

export const getBudgetCategories = async (budgetId: string): Promise<BudgetCategory[]> => {
  return await supaSelect<BudgetCategory[]>(
    supabase
      .from('budget_categories')
      .select('*')
      .eq('budget_id', budgetId)
      .order('display_order', { ascending: true }),
    { errorMessage: 'Error fetching budget categories' }
  );
};

export const getBudgetTransactions = async (budgetId: string): Promise<BudgetTransaction[]> => {
  return await supaSelect<BudgetTransaction[]>(
    supabase
      .from('budget_transactions')
      .select('*')
      .eq('budget_id', budgetId)
      .order('transaction_date', { ascending: false }),
    { errorMessage: 'Error fetching budget transactions' }
  );
};

export const createBudget = async (data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> => {
  return await supaInsert<Budget>(
    supabase
      .from('budgets')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating budget' }
  );
};

export const updateBudget = async (id: string, data: Partial<Budget>): Promise<Budget> => {
  return await supaUpdate<Budget>(
    supabase
      .from('budgets')
      .update(data)
      .eq('id', id)
      .select()
      .single(),
    { errorMessage: 'Error updating budget' }
  );
};

// Category operations
export const createBudgetCategory = async (data: Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetCategory> => {
  return await supaInsert<BudgetCategory>(
    supabase
      .from('budget_categories')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating budget category' }
  );
};

export const updateBudgetCategory = async (id: string, data: Partial<BudgetCategory>): Promise<BudgetCategory> => {
  return await supaUpdate<BudgetCategory>(
    supabase
      .from('budget_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single(),
    { errorMessage: 'Error updating budget category' }
  );
};

// Transaction operations
export const createBudgetTransaction = async (data: Omit<BudgetTransaction, 'id' | 'created_at'>): Promise<BudgetTransaction> => {
  return await supaInsert<BudgetTransaction>(
    supabase
      .from('budget_transactions')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating budget transaction' }
  );
};

// Import from quote
export const importBudgetFromQuote = async (
  orderId: string,
  quoteId: string,
  supplierId: string,
  clientId: string
): Promise<string> => {
  const { data, error } = await supabase.rpc('import_budget_from_quote', {
    p_order_id: orderId,
    p_quote_id: quoteId,
    p_supplier_id: supplierId,
    p_client_id: clientId
  });

  if (error) {
    throw new Error(error.message || 'Error importing budget from quote');
  }

  return data as string;
};

// Apply change order to budget
export const applyChangeOrderToBudget = async (
  budgetId: string,
  changeOrderId: string,
  categoryId: string,
  amount: number
): Promise<void> => {
  const { error } = await supabase.rpc('apply_change_order_to_budget', {
    p_budget_id: budgetId,
    p_change_order_id: changeOrderId,
    p_category_id: categoryId,
    p_amount: amount
  });

  if (error) {
    throw new Error(error.message || 'Error applying change order to budget');
  }
};

// Record payment as actual
export const recordPaymentActual = async (
  budgetId: string,
  paymentLinkId: string,
  categoryId: string,
  amount: number
): Promise<void> => {
  const { error } = await supabase.rpc('record_payment_actual', {
    p_budget_id: budgetId,
    p_payment_link_id: paymentLinkId,
    p_category_id: categoryId,
    p_amount: amount
  });

  if (error) {
    throw new Error(error.message || 'Error recording payment actual');
  }
};

// Recalculate budget totals
export const recalculateBudgetTotals = async (budgetId: string): Promise<void> => {
  const { error } = await supabase.rpc('recalculate_budget_totals', {
    p_budget_id: budgetId
  });

  if (error) {
    throw new Error(error.message || 'Error recalculating budget totals');
  }
};

// Export budget to CSV
export const exportBudgetCSV = (budget: BudgetWithCategories): string => {
  const headers = [
    'Category',
    'Planned Amount',
    'Committed Amount', 
    'Actual Amount',
    'Variance Amount',
    'Variance %'
  ];

  const rows = budget.categories.map(category => [
    category.name,
    category.planned_amount.toString(),
    category.committed_amount.toString(),
    category.actual_amount.toString(),
    category.variance_amount.toString(),
    category.variance_percentage.toString() + '%'
  ]);

  // Add totals row
  rows.push([
    'TOTAL',
    budget.total_planned.toString(),
    budget.total_committed.toString(),
    budget.total_actual.toString(),
    budget.variance.toString(),
    budget.total_planned > 0 ? ((budget.variance / budget.total_planned) * 100).toFixed(2) + '%' : '0%'
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
};

// Download CSV file
export const downloadBudgetCSV = (budget: BudgetWithCategories, filename?: string): void => {
  const csvContent = exportBudgetCSV(budget);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `budget-${budget.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};