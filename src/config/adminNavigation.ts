import { BarChart3, FileText, Home, Layout, LucideIcon, MessageSquare, Tag, Users } from "lucide-react";

export interface AdminNavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  isImplemented: boolean;
}

export const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  { id: "dashboard", label: "לוח בקרה", path: "/admin/dashboard", icon: Home, isImplemented: true },
  { id: "analytics", label: "אנליטיקה", path: "/admin/analytics", icon: BarChart3, isImplemented: true },
  { id: "customers", label: "לקוחות", path: "/admin/customers", icon: Users, isImplemented: true },
  { id: "suppliers", label: "ספקים", path: "/admin/suppliers", icon: Users, isImplemented: true },
  { id: "categories", label: "קטגוריות", path: "/admin/categories", icon: Tag, isImplemented: true },
  { id: "homepage", label: "עמוד הבית", path: "/admin/homepage-content", icon: Layout, isImplemented: true },
  { id: "reports", label: "דוחות", path: "/admin/reports", icon: FileText, isImplemented: false },
  { id: "automation", label: "אוטומציה", path: "/admin/automation", icon: MessageSquare, isImplemented: false },
  { id: "permissions", label: "הרשאות", path: "/admin/permissions", icon: Users, isImplemented: false },
];
