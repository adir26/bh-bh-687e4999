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

const WEBHOOK_BASE_URL = 'https://yislkmhnitznvbxfpcxd.supabase.co/functions/v1/facebook-webhook';

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function buildWebhookUrl(supplierId: string, token: string): string {
  return `${WEBHOOK_BASE_URL}/${supplierId}?token=${token}`;
}

export function useSupplierWebhook(supplierId: string | null) {
  const queryClient = useQueryClient();

  const { data: webhook, isLoading, error: webhookError } = useQuery({
    queryKey: ['supplier-webhook', supplierId],
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!supplierId) return null;

      // Try to get existing webhook
      const { data: existing, error: fetchError } = await supabase
        .from('supplier_webhooks')
        .select('*')
        .eq('supplier_id', supplierId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching webhook:', fetchError);
        throw fetchError;
      }

      if (existing) {
        return existing as SupplierWebhook;
      }

      // Create new webhook
      const newToken = generateToken();
      const newUrl = buildWebhookUrl(supplierId, newToken);

      const { data: newWebhook, error: insertError } = await supabase
        .from('supplier_webhooks')
        .insert({
          supplier_id: supplierId,
          secret_token: newToken,
          webhook_url: newUrl,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating webhook:', insertError);
        throw insertError;
      }

      return newWebhook as SupplierWebhook;
    },
  });

  const regenerateToken = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error('No supplier ID');

      const newToken = generateToken();
      const newUrl = buildWebhookUrl(supplierId, newToken);

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
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
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
    webhookError,
    regenerateToken,
    toggleActive,
  };
}
