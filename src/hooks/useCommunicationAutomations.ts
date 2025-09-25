import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationAutomationService, CommunicationAutomation } from '@/services/communicationAutomationService';
import { showToast } from '@/utils/toast';

export function useCommunicationAutomations(supplierId?: string) {
  return useQuery({
    queryKey: ['communication-automations', supplierId],
    queryFn: () => communicationAutomationService.getAutomations(supplierId),
  });
}

export function useTemplateAutomations() {
  return useQuery({
    queryKey: ['template-automations'],
    queryFn: () => communicationAutomationService.getTemplateAutomations(),
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: communicationAutomationService.createAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-automations'] });
      showToast.success('כלל אוטומציה נוצר בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה ביצירת כלל האוטומציה');
    }
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CommunicationAutomation> }) =>
      communicationAutomationService.updateAutomation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-automations'] });
      showToast.success('כלל האוטומציה עודכן בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון כלל האוטומציה');
    }
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      communicationAutomationService.toggleAutomation(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['communication-automations'] });
      showToast.success(isActive ? 'כלל האוטומציה הופעל' : 'כלל האוטומציה הושבת');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון סטטוס כלל האוטומציה');
    }
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: communicationAutomationService.deleteAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-automations'] });
      showToast.success('כלל האוטומציה נמחק בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה במחיקת כלל האוטומציה');
    }
  });
}

export function useAutomationJobs(automationId?: string) {
  return useQuery({
    queryKey: ['automation-jobs', automationId],
    queryFn: () => communicationAutomationService.getJobs(automationId),
  });
}

export function useJobStats(supplierId?: string) {
  return useQuery({
    queryKey: ['job-stats', supplierId],
    queryFn: () => communicationAutomationService.getJobStats(supplierId),
  });
}

export function useQuietHours(supplierId?: string) {
  return useQuery({
    queryKey: ['quiet-hours', supplierId],
    queryFn: () => communicationAutomationService.getQuietHours(supplierId),
  });
}

export function useUpsertQuietHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: communicationAutomationService.upsertQuietHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiet-hours'] });
      showToast.success('הגדרות שעות שקט עודכנו בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון הגדרות שעות השקט');
    }
  });
}

export function useRateLimits(supplierId?: string) {
  return useQuery({
    queryKey: ['rate-limits', supplierId],
    queryFn: () => communicationAutomationService.getRateLimits(supplierId),
  });
}

export function useUpsertRateLimit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: communicationAutomationService.upsertRateLimit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-limits'] });
      showToast.success('מגבלות תדירות עודכנו בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון מגבלות התדירות');
    }
  });
}

export function useAutomationAnalytics(supplierId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['automation-analytics', supplierId, days],
    queryFn: () => communicationAutomationService.getAutomationAnalytics(supplierId, days),
  });
}