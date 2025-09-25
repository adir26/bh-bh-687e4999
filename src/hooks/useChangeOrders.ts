import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changeOrdersService, ChangeOrder, ChangeOrderItem } from '@/services/changeOrdersService';
import { showToast } from '@/utils/toast';

export function useChangeOrdersForOrder(orderId: string) {
  return useQuery({
    queryKey: ['change-orders', orderId],
    queryFn: () => changeOrdersService.getChangeOrdersForOrder(orderId),
    enabled: !!orderId,
  });
}

export function useChangeOrder(id: string) {
  return useQuery({
    queryKey: ['change-order', id],
    queryFn: () => changeOrdersService.getChangeOrder(id),
    enabled: !!id,
  });
}

export function useCreateChangeOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeOrdersService.createChangeOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      showToast.success('צו שינוי נוצר בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה ביצירת צו השינוי');
    }
  });
}

export function useUpdateChangeOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ChangeOrder> }) =>
      changeOrdersService.updateChangeOrder(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['change-order', id] });
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      showToast.success('צו השינוי עודכן בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון צו השינוי');
    }
  });
}

export function useAddChangeOrderItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeOrdersService.addItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['change-order', data.change_order_id] });
      showToast.success('פריט נוסף בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בהוספת הפריט');
    }
  });
}

export function useUpdateChangeOrderItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ChangeOrderItem> }) =>
      changeOrdersService.updateItem(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['change-order', data.change_order_id] });
    },
    onError: () => {
      showToast.error('שגיאה בעדכון הפריט');
    }
  });
}

export function useDeleteChangeOrderItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeOrdersService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-order'] });
      showToast.success('פריט נמחק בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה במחיקת הפריט');
    }
  });
}

export function useSendForApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeOrdersService.sendForApproval,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['change-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      showToast.success('צו השינוי נשלח לאישור');
    },
    onError: () => {
      showToast.error('שגיאה בשליחת צו השינוי לאישור');
    }
  });
}

export function useApproveChangeOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeOrdersService.approveChangeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-order'] });
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast.success('צו השינוי אושר בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה באישור צו השינוי');
    }
  });
}

export function useRejectChangeOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      changeOrdersService.rejectChangeOrder(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['change-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['change-orders'] });
      showToast.success('צו השינוי נדחה');
    },
    onError: () => {
      showToast.error('שגיאה בדחיית צו השינוי');
    }
  });
}