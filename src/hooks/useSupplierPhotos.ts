import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Photo } from '@/types/inspiration';

/**
 * Hook to fetch approved inspiration photos for a supplier
 */
export function useSupplierPhotos(companyId: string | undefined) {
  return useQuery({
    queryKey: ['supplier-photos', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('photos')
        .select(`
          id,
          title,
          description,
          storage_path,
          room,
          style,
          width,
          height,
          is_public,
          created_at,
          uploader_id,
          company_id
        `)
        .eq('company_id', companyId)
        .eq('status', 'approved')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching supplier photos:', error);
        throw error;
      }

      return (data || []) as Photo[];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
