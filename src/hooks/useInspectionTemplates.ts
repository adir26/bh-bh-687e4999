import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';

export interface InspectionTemplate {
  id: string;
  name: string;
  report_type: string;
  layout_json: Record<string, any>;
  brand_color: string;
  logo_url?: string;
  intro_text?: string;
  outro_text?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useInspectionTemplates(reportType?: string) {
  return useQuery({
    queryKey: ['inspection-templates', reportType],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_templates')
        .select('*')
        .order('name');

      if (reportType) {
        query = query.eq('report_type', reportType);
      }

      const data = await supaSelect<InspectionTemplate[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת תבניות',
      });

      return data;
    },
  });
}
