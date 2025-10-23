import { useLocation, useNavigate } from "react-router-dom";
import { ENABLED_ADMIN_ROUTES } from "@/config/adminFlags";
import { ADMIN_NAVIGATION_ITEMS } from "@/config/adminNavigation";

const enabledRoutes = new Set(
  ENABLED_ADMIN_ROUTES === "ALL"
    ? ADMIN_NAVIGATION_ITEMS.filter((item) => item.isImplemented).map((item) => item.path)
    : ENABLED_ADMIN_ROUTES
);

const navItems = ADMIN_NAVIGATION_ITEMS.filter((item) => enabledRoutes.has(item.path));

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