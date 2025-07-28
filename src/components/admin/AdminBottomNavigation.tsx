import { Home, Users, ShoppingCart, MessageSquare, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { 
    id: "dashboard", 
    label: "לוח בקרה", 
    icon: Home, 
    path: "/admin/dashboard" 
  },
  { 
    id: "suppliers", 
    label: "ספקים", 
    icon: Users, 
    path: "/admin/suppliers" 
  },
  { 
    id: "orders", 
    label: "הזמנות", 
    icon: ShoppingCart, 
    path: "/admin/orders" 
  },
  { 
    id: "support", 
    label: "תמיכה", 
    icon: MessageSquare, 
    path: "/admin/support" 
  },
  { 
    id: "settings", 
    label: "הגדרות", 
    icon: Settings, 
    path: "/admin/settings" 
  },
];

export function AdminBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="bottom-nav md:hidden">
      <div className="flex h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item flex-1 ${isActive ? 'active' : ''}`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}