import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupplierProject {
  id: string;
  title: string;
  client_id: string;
  client_name?: string;
  status: string;
  created_at: string;
}

export function useSupplierProjects(clientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['supplier-projects', user?.id, clientId],
    enabled: !!user?.id,
    queryFn: async () => {
      const filters: any = { supplier_id: user!.id };
      if (clientId) filters.client_id = clientId;

      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, client_id, status, created_at')
        .match(filters)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!projects || projects.length === 0) return [];

      const clientIds = [...new Set(projects.map((p: any) => p.client_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', clientIds);

      const profilesMap = new Map(profiles?.map((p: any) => [p.id, p.full_name]) || []);

      return projects.map((project: any) => ({
        id: project.id,
        title: project.title,
        client_id: project.client_id,
        client_name: profilesMap.get(project.client_id),
        status: project.status,
        created_at: project.created_at
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
