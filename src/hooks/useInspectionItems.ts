import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaInsert, supaUpdate, supaDelete } from '@/lib/supaFetch';
import { toast } from 'sonner';

export interface InspectionItem {
  id: string;
  report_id: string;
  category: string;
  title: string;
  location?: string;
  description?: string;
  status_check?: 'ok' | 'not_ok' | 'na';
  severity?: 'low' | 'medium' | 'high';
  standard_code?: string;
  standard_clause?: string;
  standard_quote?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionItemFilters {
  category?: string;
  status_check?: string[];
  severity?: string;
  search?: string;
}

export function useInspectionItems(reportId: string, filters?: InspectionItemFilters) {
  return useQuery({
    queryKey: ['inspection-items', reportId, filters],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_items')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status_check && filters.status_check.length > 0) {
        query = query.in('status_check', filters.status_check);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      const data = await supaSelect<InspectionItem[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת ממצאים',
      });

      return data;
    },
  });
}

export function useCreateInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<InspectionItem, 'id' | 'created_at' | 'updated_at'>) => {
      const query = supabase
        .from('inspection_items')
        .insert(item)
        .select()
        .single();

      return await supaInsert<InspectionItem>(query, {
        errorMessage: 'שגיאה ביצירת ממצא',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-items', variables.report_id] });
      toast.success('הממצא נוסף בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה ביצירת ממצא');
    },
  });
}

export function useUpdateInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reportId, ...updates }: Partial<InspectionItem> & { id: string; reportId: string }) => {
      const query = supabase
        .from('inspection_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return await supaUpdate<InspectionItem>(query, {
        errorMessage: 'שגיאה בעדכון ממצא',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-items', variables.reportId] });
      toast.success('הממצא עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון ממצא');
    },
  });
}

export function useDeleteInspectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reportId }: { id: string; reportId: string }) => {
      const query = supabase
        .from('inspection_items')
        .delete()
        .eq('id', id);

      return await supaDelete(query, {
        errorMessage: 'שגיאה במחיקת ממצא',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-items', variables.reportId] });
      toast.success('הממצא נמחק בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת ממצא');
    },
  });
}
