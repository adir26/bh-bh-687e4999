import { Home, BarChart3, Users, Settings, MessageSquare, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { 
    id: "dashboard", 
    label: "לוח בקרה", 
    icon: Home, 
    path: "/admin/dashboard" 
  },
  { 
    id: "analytics", 
    label: "אנליטיקה", 
    icon: BarChart3, 
    path: "/admin/analytics" 
  },
  { 
    id: "reports", 
    label: "דוחות", 
    icon: FileText, 
    path: "/admin/reports" 
  },
  { 
    id: "automation", 
    label: "אוטומציה", 
    icon: MessageSquare, 
    path: "/admin/automation" 
  },
  { 
    id: "permissions", 
    label: "הרשאות", 
    icon: Users, 
    path: "/admin/permissions" 
  },
];

export function AdminBottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="bottom-nav md:hidden">
      <div className="flex h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
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