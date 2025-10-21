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
          created_at
        `)
        .eq('supplier_id', supplierId)
        .in('status', ['new', 'followup', 'no_answer', 'project_in_process'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SupplierLead[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
