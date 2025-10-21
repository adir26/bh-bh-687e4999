export type ProjectDetailedStatus = 
  | 'new'
  | 'waiting_for_scheduling'
  | 'measurement'
  | 'waiting_for_client_approval'
  | 'in_progress'
  | 'in_progress_preparation'
  | 'on_hold'
  | 'completed'
  | 'waiting_for_final_payment'
  | 'closed_paid_in_full'
  | 'cancelled';

export interface ProjectParticipant {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export const PROJECT_STATUS_WORKFLOW: Record<ProjectDetailedStatus, {
  label: string;
  color: string;
  next?: ProjectDetailedStatus[];
}> = {
  new: {
    label: 'חדש',
    color: 'blue',
    next: ['waiting_for_scheduling', 'cancelled'],
  },
  waiting_for_scheduling: {
    label: 'בהמתנה לתיאום',
    color: 'yellow',
    next: ['measurement', 'cancelled'],
  },
  measurement: {
    label: 'מדידה',
    color: 'purple',
    next: ['waiting_for_client_approval', 'cancelled'],
  },
  waiting_for_client_approval: {
    label: 'ממתין לאישור לקוח',
    color: 'orange',
    next: ['in_progress', 'cancelled'],
  },
  in_progress: {
    label: 'בביצוע',
    color: 'green',
    next: ['in_progress_preparation', 'on_hold', 'completed'],
  },
  in_progress_preparation: {
    label: 'בביצוע - שלבי הכנה',
    color: 'green',
    next: ['in_progress', 'on_hold', 'completed'],
  },
  on_hold: {
    label: 'בהשהיה',
    color: 'gray',
    next: ['in_progress', 'cancelled'],
  },
  completed: {
    label: 'הושלם',
    color: 'teal',
    next: ['waiting_for_final_payment'],
  },
  waiting_for_final_payment: {
    label: 'ממתין לתשלום סופי',
    color: 'amber',
    next: ['closed_paid_in_full'],
  },
  closed_paid_in_full: {
    label: 'נסגר - שולם במלואו',
    color: 'emerald',
  },
  cancelled: {
    label: 'בוטל',
    color: 'red',
  },
};
