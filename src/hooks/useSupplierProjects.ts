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
      // 1. Find all projects where the supplier is a participant
      const { data: participations, error: partError } = await supabase
        .from('project_participants')
        .select('project_id')
        .eq('user_id', user!.id)
        .eq('role', 'editor');

      if (partError) throw partError;
      if (!participations || participations.length === 0) return [];

      const projectIds = participations.map(p => p.project_id);

      // 2. Fetch the projects
      let query = supabase
        .from('projects')
        .select('id, title, client_id, status, detailed_status, created_at')
        .in('id', projectIds);

      // 3. Filter by client_id if specified
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: projects, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!projects || projects.length === 0) return [];

      // 4. Fetch client names
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
    staleTime: 0,
  });
}
