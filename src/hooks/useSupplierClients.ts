import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupplierClient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export function useSupplierClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['supplier-clients', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Get unique client IDs from orders and leads
      const { data: orders } = await supabase
        .from('orders')
        .select('client_id, customer_phone')
        .eq('supplier_id', user!.id);

      const { data: leads } = await supabase
        .from('leads')
        .select('client_id, contact_phone')
        .eq('supplier_id', user!.id)
        .not('client_id', 'is', null);

      // Get unique client IDs
      const clientPhones = new Map<string, string>();
      orders?.forEach(o => {
        if (o.client_id && o.customer_phone) {
          clientPhones.set(o.client_id, o.customer_phone);
        }
      });
      leads?.forEach(l => {
        if (l.client_id && l.contact_phone && !clientPhones.has(l.client_id)) {
          clientPhones.set(l.client_id, l.contact_phone);
        }
      });

      const uniqueClientIds = Array.from(new Set([
        ...(orders?.map(o => o.client_id) || []),
        ...(leads?.map(l => l.client_id) || [])
      ])).filter(Boolean) as string[];

      if (uniqueClientIds.length === 0) {
        return [];
      }

      // Fetch profile data for these clients
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uniqueClientIds);

      if (error) throw error;

      return (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'ללא שם',
        email: profile.email || '',
        phone: clientPhones.get(profile.id)
      })).sort((a, b) => a.full_name.localeCompare(b.full_name, 'he'));
    },
    staleTime: 0,
  });
}
