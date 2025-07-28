import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Star,
  Package,
  Tag,
  Settings,
  Bell,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "לוח בקרה", url: "/admin/dashboard", icon: Home },
  { title: "אנליטיקה", url: "/admin/analytics", icon: BarChart3 },
  { title: "משתמשים", url: "/admin/users", icon: Users },
  { title: "הזמנות", url: "/admin/orders", icon: ShoppingCart },
  { title: "הצעות מחיר", url: "/admin/quotes", icon: FileText },
  { title: "הצעות", url: "/admin/proposals", icon: FileText },
  { title: "תלונות", url: "/admin/complaints", icon: MessageSquare },
  { title: "ביקורות", url: "/admin/reviews", icon: Star },
  { title: "מוצרים", url: "/admin/products", icon: Package },
  { title: "קטגוריות", url: "/admin/categories", icon: Tag },
  { title: "התראות", url: "/admin/notifications", icon: Bell },
  { title: "הגדרות", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="font-hebrew">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-primary text-right">
            {!isCollapsed && "פאנל ניהול"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${getNavClass(item.url)} text-right`}
                    >
                      <item.icon className="h-4 w-4 ml-2" />
                      {!isCollapsed && <span className="flex-1 text-right">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}