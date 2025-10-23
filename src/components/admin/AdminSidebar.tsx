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
import { Home, BarChart3, Users, Tag, Layout } from "lucide-react";

// Hardcoded navigation - only 6 items allowed
const navigationItems = [
  { id: "dashboard", label: "לוח בקרה", path: "/admin/dashboard", icon: Home },
  { id: "analytics", label: "אנליטיקה", path: "/admin/analytics", icon: BarChart3 },
  { id: "customers", label: "לקוחות", path: "/admin/customers", icon: Users },
  { id: "suppliers", label: "ספקים", path: "/admin/suppliers", icon: Users },
  { id: "categories", label: "קטגוריות", path: "/admin/categories", icon: Tag },
  { id: "homepage", label: "עמוד הבית", path: "/admin/homepage-content", icon: Layout },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);
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
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${getNavClass(item.path)} text-right`}
                    >
                      <item.icon className="h-4 w-4 ml-2" />
                      {!isCollapsed && <span className="flex-1 text-right">{item.label}</span>}
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