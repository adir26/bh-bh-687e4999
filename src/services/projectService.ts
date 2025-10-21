import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type ProjectDetailedStatus = Database['public']['Enums']['project_detailed_status'];

export const PROJECT_STATUS_LABELS: Record<ProjectDetailedStatus, string> = {
  new: 'חדש',
  waiting_for_scheduling: 'בהמתנה לתיאום',
  measurement: 'מדידה',
  waiting_for_client_approval: 'ממתין לאישור לקוח',
  in_progress: 'בביצוע',
  in_progress_preparation: 'בביצוע - שלבי הכנה',
  on_hold: 'בהשהיה',
  completed: 'הושלם',
  waiting_for_final_payment: 'ממתין לתשלום סופי',
  closed_paid_in_full: 'נסגר - שולם במלואו',
  cancelled: 'בוטל',
};

export interface CreateProjectData {
  title: string;
  description?: string;
  client_id: string;
  supplier_id: string;
  category_id?: string;
  detailed_status?: ProjectDetailedStatus;
  budget_min?: number;
  budget_max?: number;
  location?: string;
}

export async function createProjectWithParticipants(
  data: CreateProjectData
): Promise<string> {
  const { data: projectId, error } = await supabase.rpc(
    'rpc_create_project_with_participants',
    {
      p_title: data.title,
      p_description: data.description || null,
      p_client_id: data.client_id,
      p_supplier_id: data.supplier_id,
      p_category_id: data.category_id || null,
      p_detailed: data.detailed_status || 'new',
      p_budget_min: data.budget_min || null,
      p_budget_max: data.budget_max || null,
      p_location: data.location || null,
    }
  );

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message || 'שגיאה ביצירת פרויקט');
  }

  return projectId;
}
