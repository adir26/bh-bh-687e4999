// KPI and analytics type definitions

export interface DateRange {
  from: Date;
  to: Date;
}

export interface KpiData {
  date: string;
  new_users: number;
  new_suppliers: number;
  orders_count: number;
  gmv_ils: number;
  revenue_ils: number;
}

export interface TopSupplier {
  name: string;
  supplier_id: string;
  orders: number;
  gmv_ils: number;
  revenue_ils: number;
}

export interface TopCategory {
  category_name: string;
  category_id: string;
  orders: number;
  gmv_ils: number;
}

export interface KpiSummary {
  total_users: number;
  total_suppliers: number;
  total_orders: number;
  total_gmv: number;
  total_revenue: number;
  avg_rating: number;
  // Period over period changes
  users_change: number;
  suppliers_change: number;
  orders_change: number;
  revenue_change: number;
}

export interface AdminAuditEvent {
  id: string;
  admin_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

// Date range presets for the date picker
export const DATE_RANGE_PRESETS = [
  { key: '7d', label: '7 ימים אחרונים', days: 7 },
  { key: '30d', label: '30 ימים אחרונים', days: 30 },
  { key: '90d', label: '90 ימים אחרונים', days: 90 },
  { key: 'mtd', label: 'החודש הנוכחי', days: null },
  { key: 'lm', label: 'החודש הקודם', days: null },
  { key: 'custom', label: 'טווח מותאם', days: null },
] as const;

export type DateRangePreset = typeof DATE_RANGE_PRESETS[number]['key'];