import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  reviewer_name?: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
}

export const useCompanyReviews = (companyId: string) => {
  return useQuery({
    queryKey: ['company-reviews', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(full_name, email)
        `)
        .eq('reviewed_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to include reviewer name
      return (data || []).map((review: any) => ({
        ...review,
        reviewer_name: review.reviewer?.full_name || review.reviewer?.email?.split('@')[0] || 'משתמש'
      })) as Review[];
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
