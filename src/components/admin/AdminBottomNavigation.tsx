import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Users, Tag, Layout } from "lucide-react";

// Hardcoded navigation - only 6 items allowed
const navItems = [
  { id: "dashboard", label: "בקרה", path: "/admin/dashboard", icon: Home },
  { id: "analytics", label: "דוחות", path: "/admin/analytics", icon: BarChart3 },
  { id: "customers", label: "לקוחות", path: "/admin/customers", icon: Users },
  { id: "suppliers", label: "ספקים", path: "/admin/suppliers", icon: Users },
  { id: "categories", label: "קטגוריות", path: "/admin/categories", icon: Tag },
  { id: "homepage", label: "עמוד בית", path: "/admin/homepage-content", icon: Layout },
];

export function AdminBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="bottom-nav md:hidden">
      <div className="flex h-full px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item flex-1 ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <item.icon className="h-4 w-4 md:h-5 md:w-5 mb-1 flex-shrink-0" />
              <span className="text-2xs md:text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}