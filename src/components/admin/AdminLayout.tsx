import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNavigation } from "./AdminBottomNavigation";
import { useSecureAdminAuth } from "@/hooks/useSecureAdminAuth";
import { SecureStorage } from "@/utils/secureStorage";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminAuthenticated, isValidating, validateAdminAccess } = useSecureAdminAuth();
  const isAuthExempt = location.pathname === "/admin/login" || location.pathname === "/admin/forbidden";

  useEffect(() => {
    if (isAuthExempt) return;

    const checkAdminAuth = async () => {
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
  }, [navigate, location.pathname, validateAdminAccess, isAuthExempt]);

  if (isAuthExempt) {
    return (
      <div className="admin-rtl min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </div>
    );
  }

  // Block access if admin authentication is not validated
  if (isValidating) {
    return (
      <div className="admin-rtl min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">מאמת הרשאות ניהול...</p>
            <p className="text-sm text-muted-foreground">אנא המתן בזמן שאנו מוודאים שהגישה שלך מאושרת</p>
          </div>
        </div>
      </div>
    );
  }

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