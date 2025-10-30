import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupplierWebhook {
  id: string;
  supplier_id: string;
  secret_token: string;
  webhook_url: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function useSupplierWebhook(supplierId: string | null) {
  const queryClient = useQueryClient();

  const { data: webhook, isLoading } = useQuery({
    queryKey: ['supplier-webhook', supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      if (!supplierId) return null;

      // First check if webhook exists
      const { data: existing, error: fetchError } = await supabase
        .from('supplier_webhooks')
        .select('*')
        .eq('supplier_id', supplierId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existing) return existing as SupplierWebhook;

      // If not, create it using the function
      const { data, error } = await supabase
        .rpc('get_or_create_supplier_webhook', { p_supplier_id: supplierId });

      if (error) throw error;
      return data?.[0] as SupplierWebhook;
    },
  });

  const regenerateToken = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error('No supplier ID');

      // Generate new token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_webhook_token');

      if (tokenError) throw tokenError;

      const newToken = tokenData as string;
      const newUrl = `https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/facebook-webhook/${supplierId}?token=${newToken}`;

      // Update webhook
      const { error } = await supabase
        .from('supplier_webhooks')
        .update({
          secret_token: newToken,
          webhook_url: newUrl,
          updated_at: new Date().toISOString()
        })
        .eq('supplier_id', supplierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-webhook', supplierId] });
      toast.success('טוקן חדש נוצר בהצלחה');
    },
    onError: (error) => {
      console.error('Error regenerating token:', error);
      toast.error('שגיאה ביצירת טוקן חדש');
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (!supplierId) throw new Error('No supplier ID');

      const { error } = await supabase
        .from('supplier_webhooks')
        .update({ is_active: isActive })
        .eq('supplier_id', supplierId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-webhook', supplierId] });
      toast.success('סטטוס עודכן בהצלחה');
    },
    onError: (error) => {
      console.error('Error toggling webhook:', error);
      toast.error('שגיאה בעדכון סטטוס');
    },
  });

  return {
    webhook,
    isLoading,
    regenerateToken,
    toggleActive,
  };
}
