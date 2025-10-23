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
import { ENABLED_ADMIN_ROUTES } from "@/config/adminFlags";
import { ADMIN_NAVIGATION_ITEMS } from "@/config/adminNavigation";

const enabledRoutes = new Set(
  ENABLED_ADMIN_ROUTES === "ALL"
    ? ADMIN_NAVIGATION_ITEMS.filter((item) => item.isImplemented).map((item) => item.path)
    : ENABLED_ADMIN_ROUTES
);

const navigationItems = ADMIN_NAVIGATION_ITEMS.filter((item) => enabledRoutes.has(item.path));

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