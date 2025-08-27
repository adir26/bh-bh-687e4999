import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNavigation } from "./AdminBottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { SecureStorage } from "@/utils/secureStorage";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminAuthenticated, validateAdminAccess } = useSecureAdminAuth();

  useEffect(() => {
    const checkAdminAuth = async () => {
      if (location.pathname === "/admin/login") return;
      
      // Use secure admin authentication
      const isValid = await validateAdminAccess();
      if (!isValid) {
        // Clear any insecure legacy data
        SecureStorage.remove('adminAuthenticated');
        SecureStorage.remove('adminUserId');
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminUserId");
        navigate("/admin/login");
      }
    };

    checkAdminAuth();
  }, [navigate, location.pathname, validateAdminAccess]);

  const isLoginPage = location.pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="admin-rtl">{children}</div>;
  }

  // Block access if admin authentication is not validated
  if (!isAdminAuthenticated) {
    return null; // Let the useEffect handle navigation
  }

  return (
    <div className="admin-rtl">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Desktop Sidebar - Collapsible */}
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 overflow-auto pb-20 md:pb-6">
              <div className="p-4 md:p-6 max-w-full">
                {children}
              </div>
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <AdminBottomNavigation />
        </div>
      </SidebarProvider>
    </div>
  );
}