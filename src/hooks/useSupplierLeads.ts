import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupplierLead {
  id: string;
  name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  source_key: string | null;
  priority_key: string | null;
  client_id: string | null;
  created_at: string;
  consent_to_share: boolean;
  budget_range: string | null;
  start_date: string | null;
  end_date: string | null;
  lead_score?: {
    score: number;
    breakdown: {
      budget: number;
      urgency: number;
      completeness: number;
      intent: number;
    };
  } | null;
}

export function useSupplierLeads(supplierId: string) {
  return useQuery({
    queryKey: ['supplier-leads', supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          contact_email,
          contact_phone,
          status,
          source_key,
          priority_key,
          client_id,
          created_at,
          consent_to_share,
          budget_range,
          start_date,
          end_date,
          lead_scores!left (
            score,
            breakdown
          )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const leads = (data || []).map(lead => ({
        ...lead,
        lead_score: Array.isArray(lead.lead_scores) && lead.lead_scores.length > 0
          ? lead.lead_scores[0]
          : null,
        lead_scores: undefined, // Remove the array
      }));
      
      return leads as SupplierLead[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
