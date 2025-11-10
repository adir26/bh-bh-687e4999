import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supaSelect } from '@/lib/supaFetch';

export interface InspectionReport {
  id: string;
  project_id?: string;
  client_id: string;
  supplier_id: string;
  report_type: string;
  status: 'draft' | 'in_progress' | 'final' | 'sent';
  version: number;
  is_recurring: boolean;
  pdf_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InspectionReportFilters {
  status?: string[];
  report_type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InspectionKPIs {
  draft: number;
  in_progress: number;
  final: number;
  sent: number;
}

export function useInspectionReports(filters?: InspectionReportFilters) {
  return useQuery({
    queryKey: ['inspection-reports', filters],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('inspection_reports')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.report_type) {
        query = query.eq('report_type', filters.report_type);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.search) {
        query = query.or(`notes.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      const data = await supaSelect<InspectionReport[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת דוחות',
      });

      return data;
    },
  });
}

export function useInspectionKPIs() {
  return useQuery({
    queryKey: ['inspection-kpis'],
    queryFn: async ({ signal }) => {
      const query = supabase
        .from('inspection_reports')
        .select('status');

      const data = await supaSelect<{ status: string }[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת KPI',
      });

      // Count by status
      const kpis: InspectionKPIs = {
        draft: 0,
        in_progress: 0,
        final: 0,
        sent: 0,
      };

      data.forEach((report) => {
        if (report.status in kpis) {
          kpis[report.status as keyof InspectionKPIs]++;
        }
      });

      return kpis;
    },
  });
}