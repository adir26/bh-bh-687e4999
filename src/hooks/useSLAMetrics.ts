import { useQuery } from '@tanstack/react-query';
import { crmAutomationService, SLAMetrics } from '@/services/crmAutomationService';

export function useSLAMetrics(supplierId?: string, days: number = 30) {
  return useQuery<SLAMetrics>({
    queryKey: ['sla-metrics', supplierId, days],
    queryFn: () => crmAutomationService.getSLAMetrics(supplierId!, days),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}