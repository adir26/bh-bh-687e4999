import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaInsert, supaUpdate, supaDelete } from '@/lib/supaFetch';
import { toast } from 'sonner';

export interface InspectionCost {
  id: string;
  item_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
}

export function useInspectionCosts(reportId: string) {
  return useQuery({
    queryKey: ['inspection-costs', reportId],
    queryFn: async ({ signal }) => {
      // Get all costs for items in this report
      const query = supabase
        .from('inspection_costs')
        .select(`
          *,
          inspection_items!inner(report_id)
        `)
        .eq('inspection_items.report_id', reportId)
        .order('created_at', { ascending: false });

      const data = await supaSelect<InspectionCost[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת עלויות',
      });

      return data;
    },
  });
}

export function useItemCosts(itemId: string) {
  return useQuery({
    queryKey: ['item-costs', itemId],
    queryFn: async ({ signal }) => {
      const query = supabase
        .from('inspection_costs')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      const data = await supaSelect<InspectionCost[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת עלויות',
      });

      return data;
    },
  });
}

export function useCreateInspectionCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: Omit<InspectionCost, 'id' | 'total' | 'created_at'>) => {
      const query = supabase
        .from('inspection_costs')
        .insert(cost)
        .select()
        .single();

      return await supaInsert<InspectionCost>(query, {
        errorMessage: 'שגיאה ביצירת עלות',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-costs', variables.item_id] });
      queryClient.invalidateQueries({ queryKey: ['inspection-costs'] });
      toast.success('העלות נוספה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה ביצירת עלות');
    },
  });
}

export function useUpdateInspectionCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, itemId, ...updates }: Partial<InspectionCost> & { id: string; itemId: string }) => {
      const query = supabase
        .from('inspection_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return await supaUpdate<InspectionCost>(query, {
        errorMessage: 'שגיאה בעדכון עלות',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-costs', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['inspection-costs'] });
      toast.success('העלות עודכנה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון עלות');
    },
  });
}

export function useDeleteInspectionCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, itemId }: { id: string; itemId: string }) => {
      const query = supabase
        .from('inspection_costs')
        .delete()
        .eq('id', id);

      return await supaDelete(query, {
        errorMessage: 'שגיאה במחיקת עלות',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-costs', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['inspection-costs'] });
      toast.success('העלות נמחקה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת עלות');
    },
  });
}
