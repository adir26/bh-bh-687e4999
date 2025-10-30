import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadScore {
  id: string;
  lead_id: string;
  score: number;
  breakdown: {
    budget: number;
    urgency: number;
    category: number;
    completeness: number;
    intent: number;
  };
  updated_at: string;
}

export function useLeadScore(leadId: string | undefined) {
  return useQuery({
    queryKey: ['lead-score', leadId],
    enabled: !!leadId,
    queryFn: async () => {
      if (!leadId) return null;

      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (error) throw error;
      return data as LeadScore | null;
    },
  });
}

export function useComputeLeadScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase.functions.invoke('compute-lead-score', {
        body: { leadId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ['lead-score', leadId] });
      queryClient.invalidateQueries({ queryKey: ['supplier-leads'] });
    },
  });
}

export function useLeadScores(leadIds: string[]) {
  return useQuery({
    queryKey: ['lead-scores', leadIds],
    enabled: leadIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .in('lead_id', leadIds);

      if (error) throw error;
      return (data || []) as LeadScore[];
    },
  });
}
