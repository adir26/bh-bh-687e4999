// Admin module type definitions
import { Database } from '@/integrations/supabase/types';

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

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

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: string[];
}

// Hebrew translations
export const STATUS_LABELS = {
  pending: 'ממתין',
  approved: 'מאושר',
  suspended: 'מושעה'
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