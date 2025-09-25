import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBudgetForOrder,
  createBudget,
  updateBudget,
  createBudgetCategory,
  updateBudgetCategory,
  createBudgetTransaction,
  importBudgetFromQuote,
  applyChangeOrderToBudget,
  recordPaymentActual,
  recalculateBudgetTotals,
  downloadBudgetCSV,
  Budget,
  BudgetCategory,
  BudgetTransaction,
  BudgetWithCategories
} from '@/services/budgetService';
import { toast } from 'sonner';

// Budget queries
export const useBudget = (orderId?: string) => {
  return useQuery({
    queryKey: ['budget', orderId],
    queryFn: () => getBudgetForOrder(orderId!),
    enabled: !!orderId,
    staleTime: 30_000,
  });
};

// Budget mutations
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget', data.order_id] });
      toast.success('Budget created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create budget');
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      updateBudget(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget', data.order_id] });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update budget');
    },
  });
};

// Category mutations
export const useCreateBudgetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBudgetCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Budget category created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create budget category');
    },
  });
};

export const useUpdateBudgetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCategory> }) =>
      updateBudgetCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Budget category updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update budget category');
    },
  });
};

// Transaction mutations
export const useCreateBudgetTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBudgetTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Budget transaction recorded successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create budget transaction');
    },
  });
};

// Import from quote
export const useImportBudgetFromQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, quoteId, supplierId, clientId }: {
      orderId: string;
      quoteId: string;
      supplierId: string;
      clientId: string;
    }) => importBudgetFromQuote(orderId, quoteId, supplierId, clientId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budget', variables.orderId] });
      toast.success('Budget imported from quote successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import budget from quote');
    },
  });
};

// Apply change order
export const useApplyChangeOrderToBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ budgetId, changeOrderId, categoryId, amount }: {
      budgetId: string;
      changeOrderId: string;
      categoryId: string;
      amount: number;
    }) => applyChangeOrderToBudget(budgetId, changeOrderId, categoryId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Change order applied to budget successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply change order to budget');
    },
  });
};

// Record payment
export const useRecordPaymentActual = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ budgetId, paymentLinkId, categoryId, amount }: {
      budgetId: string;
      paymentLinkId: string;
      categoryId: string;
      amount: number;
    }) => recordPaymentActual(budgetId, paymentLinkId, categoryId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Payment recorded as actual cost successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record payment actual');
    },
  });
};

// Recalculate totals
export const useRecalculateBudgetTotals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recalculateBudgetTotals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Budget totals recalculated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to recalculate budget totals');
    },
  });
};

// Export CSV
export const useExportBudgetCSV = () => {
  return useMutation({
    mutationFn: ({ budget, filename }: { budget: BudgetWithCategories; filename?: string }) => {
      downloadBudgetCSV(budget, filename);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Budget exported to CSV successfully');
    },
    onError: (error) => {
      toast.error('Failed to export budget CSV');
    },
  });
};