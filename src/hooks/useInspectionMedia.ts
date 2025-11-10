import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaInsert, supaDelete } from '@/lib/supaFetch';
import { toast } from 'sonner';

export interface InspectionMedia {
  id: string;
  report_id: string;
  item_id?: string;
  type: 'photo' | 'video';
  url: string;
  caption?: string;
  created_at: string;
}

export function useInspectionMedia(reportId: string, itemId?: string) {
  return useQuery({
    queryKey: ['inspection-media', reportId, itemId],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_media')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const data = await supaSelect<InspectionMedia[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת מדיה',
      });

      return data;
    },
  });
}

export function useUploadInspectionMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      reportId,
      itemId,
      type,
      caption,
    }: {
      file: File;
      reportId: string;
      itemId?: string;
      type: 'photo' | 'video';
      caption?: string;
    }) => {
      const bucket = type === 'photo' ? 'inspection-photos' : 'inspection-videos';
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}/${itemId || 'report'}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Create media record
      const query = supabase
        .from('inspection_media')
        .insert({
          report_id: reportId,
          item_id: itemId || null,
          type,
          url: publicUrl,
          caption: caption || null,
        })
        .select()
        .single();

      return await supaInsert<InspectionMedia>(query, {
        errorMessage: 'שגיאה בשמירת מדיה',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-media', variables.reportId] });
      if (variables.itemId) {
        queryClient.invalidateQueries({ queryKey: ['inspection-media', variables.reportId, variables.itemId] });
      }
      toast.success('המדיה הועלתה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בהעלאת מדיה');
    },
  });
}

export function useDeleteInspectionMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reportId, url }: { id: string; reportId: string; url: string }) => {
      // Delete from storage
      const urlParts = url.split('/');
      const bucket = url.includes('inspection-photos') ? 'inspection-photos' : 'inspection-videos';
      const fileName = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

      await supabase.storage
        .from(bucket)
        .remove([fileName]);

      // Delete record
      const query = supabase
        .from('inspection_media')
        .delete()
        .eq('id', id);

      return await supaDelete(query, {
        errorMessage: 'שגיאה במחיקת מדיה',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-media', variables.reportId] });
      toast.success('המדיה נמחקה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת מדיה');
    },
  });
}
