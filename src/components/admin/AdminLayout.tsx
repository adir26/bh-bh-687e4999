import { ReactNode, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNavigation } from "./AdminBottomNavigation";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { SecureStorage } from "@/utils/secureStorage";

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminAuthenticated, sessionExpiry, validateAdminAccess } = useSecureAdminAuth();

  const isLoginPage = location.pathname === "/admin/login";

  const checkAuth = useCallback(async () => {
    if (isLoginPage) return;
    
    // Skip validation if already authenticated and session is valid for more than 1 minute
    const msLeft = sessionExpiry ? sessionExpiry.getTime() - Date.now() : 0;
    if (isAdminAuthenticated && msLeft > 60_000) {
      return;
    }
    
    // Use secure admin authentication
    const isValid = await validateAdminAccess();
    if (!isValid) {
      // Clear any insecure legacy data - using SecureStorage only
      SecureStorage.remove('adminAuthenticated');
      SecureStorage.remove('adminUserId');
      navigate("/admin/login");
    }
  }, [isLoginPage, isAdminAuthenticated, sessionExpiry, validateAdminAccess, navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Allow rendering login page WITHOUT admin auth check
  if (isLoginPage) {
    return <div className="admin-rtl">{children || <Outlet />}</div>;
  }

  // Block access to admin panel if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">מאמת הרשאות מנהל...</p>
        </div>
      </div>
    );
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
                {children || <Outlet />}
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