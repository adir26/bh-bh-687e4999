import { LeadStatus } from '@/services/leadsService';

export const STATUSES: LeadStatus[] = [
  'new', 'no_answer', 'followup', 'no_answer_x5', 'not_relevant',
  'error', 'denies_contact', 'project_in_process', 'project_completed'
];

export function statusLabel(s: LeadStatus): string {
  switch (s) {
    case 'new': return 'חדש';
    case 'no_answer': return 'אין מענה';
    case 'followup': return 'פולואפ';
    case 'no_answer_x5': return 'אין מענה x5';
    case 'not_relevant': return 'לא רלוונטי';
    case 'error': return 'טעות';
    case 'denies_contact': return 'מכחיש פנייה';
    case 'project_in_process': return 'פרויקט בתהליך';
    case 'project_completed': return 'פרויקט הסתיים';
  }
}

export function getStatusBadgeClass(status: LeadStatus): string {
  const baseClass = "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold";
  switch (status) {
    case 'new':
      return `${baseClass} bg-blue-500 text-white hover:bg-blue-600`;
    case 'no_answer':
      return `${baseClass} bg-gray-400 text-white hover:bg-gray-500`;
    case 'followup':
      return `${baseClass} bg-amber-500 text-white hover:bg-amber-600`;
    case 'no_answer_x5':
      return `${baseClass} bg-red-500 text-white hover:bg-red-600`;
    case 'not_relevant':
      return `${baseClass} bg-gray-600 text-white hover:bg-gray-700`;
    case 'error':
      return `${baseClass} bg-red-400 text-white hover:bg-red-500`;
    case 'denies_contact':
      return `${baseClass} bg-purple-500 text-white hover:bg-purple-600`;
    case 'project_in_process':
      return `${baseClass} bg-emerald-500 text-white hover:bg-emerald-600`;
    case 'project_completed':
      return `${baseClass} bg-emerald-600 text-white hover:bg-emerald-700`;
    default:
      return `${baseClass} bg-gray-500 text-white`;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-green-100 text-green-800';
    case 'no_answer': return 'bg-yellow-100 text-yellow-800';
    case 'followup': return 'bg-blue-100 text-blue-800';
    case 'no_answer_x5': return 'bg-orange-100 text-orange-800';
    case 'not_relevant': return 'bg-gray-100 text-gray-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'denies_contact': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function priorityBadgeVariant(priority: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (priority) {
    case 'vip': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
}

export function priorityLabel(priority: string): string {
  switch (priority) {
    case 'vip': return 'VIP';
    case 'high': return 'חשוב';
    case 'medium': return 'בינוני';
    case 'low': return 'רגיל';
    default: return priority;
  }
}

export function getSourceLabel(sourceKey: string | null | undefined): string {
  const sourceLabels: Record<string, string> = {
    'website': 'אתר',
    'referral': 'הפניה',
    'social_media': 'רשתות חברתיות',
    'advertising': 'פרסום',
    'direct': 'ישיר',
    'other': 'אחר',
    'facebook_paid': 'פייסבוק ממומן',
    'facebook_organic': 'פייסבוק אורגני',
    'word_of_mouth': 'פה לאוזן',
    'whatsapp': 'וואטסאפ',
  };
  
  return sourceLabels[sourceKey || 'other'] || sourceKey || 'אתר';
}
