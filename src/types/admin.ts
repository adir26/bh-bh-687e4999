// Admin module type definitions
import { Database } from '@/integrations/supabase/types';

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
export type AdminAuditLog = Database['public']['Tables']['admin_audit_logs']['Row'];
export type LeadHistory = Database['public']['Tables']['lead_history']['Row'];
export type Refund = Database['public']['Tables']['refunds']['Row'];

export interface SupplierVerification {
  id: string;
  company_id: string;
  submitted_by: string;
  status: string;
  notes: string | null;
  documents: any; // This will be JSONB from Supabase
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface CompanyCategory {
  id: string;
  company_id: string;
  category_id: string;
  created_at: string;
}

export interface EnhancedCompany extends Company {
  owner_profile?: Partial<Profile>;
  categories?: Array<{
    category: Partial<Category>;
  }>;
  verification?: SupplierVerification;
  product_count?: number;
  recent_orders_count?: number;
}

export interface EnhancedCategory extends Category {
  children?: Category[];
  supplier_count?: number;
  product_count?: number;
}

// Customer Management Types
export interface EnhancedProfile extends Profile {
  orders_count?: number;
  complaints_count?: number;
  last_login?: string;
  total_spent?: number;
  onboarding_completion_time?: number | null;
}

export interface CustomerFilters {
  status?: 'active' | 'blocked';
  role?: 'client' | 'supplier';
  onboarding_status?: 'not_started' | 'in_progress' | 'completed';
  search?: string;
  date_from?: string;
  date_to?: string;
  is_blocked?: boolean;
}

export interface ComplaintWithDetails extends SupportTicket {
  user_profile?: Partial<Profile>;
  order?: Partial<Order>;
}

// Lead Management Types
export interface EnhancedLead extends Lead {
  client_profile?: Partial<Profile>;
  supplier_profile?: Partial<Profile>;
  lead_history?: LeadHistory[];
  activities_count?: number;
}

export interface LeadFilters {
  status?: string;
  priority?: string;
  source?: string;
  supplier_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// Order Management Types
export interface EnhancedOrder extends Order {
  client_profile?: Partial<Profile>;
  supplier_profile?: Partial<Profile>;
  refunds?: Refund[];
  refunded_amount?: number;
  status_history?: Array<{
    from_status: string;
    to_status: string;
    changed_by: string;
    created_at: string;
    note?: string;
  }>;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  supplier_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface SupplierFilters {
  status?: string;
  verification_status?: string;
  is_public?: boolean;
  featured?: boolean;
  category_id?: string;
  area?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
  is_public?: boolean;
  parent_id?: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SuppliersResponse {
  data: EnhancedCompany[];
  count: number;
  totalPages: number;
}

export interface CategoriesResponse {
  data: EnhancedCategory[];
  count: number;
  totalPages: number;
}

export interface CustomersResponse {
  data: EnhancedProfile[];
  count: number;
  totalPages: number;
}

export interface LeadsResponse {
  data: EnhancedLead[];
  count: number;
  totalPages: number;
}

export interface OrdersResponse {
  data: EnhancedOrder[];
  count: number;
  totalPages: number;
}

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: string[];
}

// Hebrew translations
export const STATUS_LABELS = {
  pending: 'ממתין',
  approved: 'מאושר',
  suspended: 'מושעה',
  active: 'פעיל',
  blocked: 'חסום'
} as const;

export const ONBOARDING_STATUS_LABELS = {
  not_started: 'לא החל',
  in_progress: 'בתהליך',
  completed: 'הושלם'
} as const;

export const VERIFICATION_STATUS_LABELS = {
  unverified: 'לא מאומת',
  pending: 'ממתין לאימות',
  verified: 'מאומת',
  rejected: 'נדחה'
} as const;

export const VISIBILITY_LABELS = {
  public: 'ציבורי',
  hidden: 'מוסתר'
} as const;

export const LEAD_STATUS_LABELS = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  proposal_sent: 'הצעה נשלחה',
  won: 'נסגר בהצלחה',
  lost: 'אבוד'
} as const;

export const ORDER_STATUS_LABELS = {
  pending: 'ממתין',
  confirmed: 'מאושר',
  in_progress: 'בטיפול',
  completed: 'הושלם',
  canceled: 'בוטל'
} as const;

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'לא שולם',
  paid: 'שולם',
  partial: 'שולם חלקית',
  refunded: 'הוחזר'
} as const;