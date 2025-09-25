
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { SecurityMiddleware } from "./components/SecurityMiddleware";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SupplierBottomNavigation } from "@/components/SupplierBottomNavigation";
import { queryClient } from "./lib/queryClient";
import QueryDebugOverlay from "./dev/QueryDebugOverlay";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import TopSuppliers from "./pages/TopSuppliers";
import NewSuppliers from "./pages/NewSuppliers";
import HotNow from "./pages/HotNow";
import LocalDeals from "./pages/LocalDeals";
import PopularNow from "./pages/PopularNow";
import SupplierProfile from "./pages/SupplierProfile";
import CategorySuppliers from "./pages/CategorySuppliers";
import NotFound from "./pages/NotFound";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SupplierProfilePreview from "./pages/SupplierProfilePreview";
import Notifications from "./pages/Notifications";
import OnboardingWelcome from "./pages/onboarding/Welcome";
import OnboardingHomeDetails from "./pages/onboarding/HomeDetails";
import OnboardingProjectPlanning from "./pages/onboarding/ProjectPlanning";
import OnboardingDocuments from "./pages/onboarding/Documents";
import OnboardingInterests from "./pages/onboarding/Interests";
import RolePicker from "./pages/onboarding/RolePicker";
import SupplierWelcome from "./pages/onboarding/SupplierWelcome";
import SupplierCompanyInfo from "./pages/onboarding/SupplierCompanyInfo";
import SupplierBranding from "./pages/onboarding/SupplierBranding";
import SupplierProducts from "./pages/onboarding/SupplierProducts";
import SupplierSummary from "./pages/onboarding/SupplierSummary";
import SupplierDashboard from "./pages/SupplierDashboard";
import OrderStatus from "./pages/orders/OrderStatus";
import LiveDeliveryTracking from "./pages/orders/LiveDeliveryTracking";
import SupplierDashboardNew from "./pages/supplier/Dashboard";
import SupplierLeadManagement from "./pages/supplier/LeadManagement";
import ProductCatalog from "./pages/supplier/ProductCatalog";
import QuoteBuilder from "./pages/supplier/QuoteBuilder";
import ProposalBuilder from "./pages/supplier/ProposalBuilder";
import SupplierOrders from "./pages/supplier/Orders";
import SupplierNotifications from "./pages/supplier/Notifications";
import NotificationSettings from "./pages/supplier/NotificationSettings";
import SupplierAnalytics from "./pages/supplier/Analytics";
import SupplierFiles from "./pages/supplier/Files";
import OrderChangeOrders from "./pages/supplier/OrderChangeOrders";
import ChangeOrderDetails from "./pages/supplier/ChangeOrderDetails";
import ProposalSignature from "./pages/ProposalSignature";
import SupplierCRM from "./pages/supplier/CRM";
import QuoteView from "./pages/QuoteView";
import Support from "./pages/Support";
import SupportChat from "./pages/SupportChat";
import ComplaintForm from "./pages/ComplaintForm";
import ComplaintDetails from "./pages/ComplaintDetails";
import Settings from "./pages/Settings";
import FAQ from "./pages/FAQ";
import NotificationPreferences from "./pages/NotificationPreferences";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import AdminOrderManagement from "./pages/admin/OrderManagement";
import AdminAnalytics from "./pages/admin/Analytics";
import SystemSettings from "./pages/admin/SystemSettings";
import SupplierManagement from "./pages/admin/SupplierManagement";
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import QuoteManagement from "./pages/admin/QuoteManagement";
import SupportChatManagement from "./pages/admin/SupportChatManagement";
import LeadManagement from "./pages/admin/LeadManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import ReviewsModeration from "./pages/admin/ReviewsModeration";
import AdvancedReports from "./pages/admin/AdvancedReports";
import AutomationCenter from "./pages/admin/AutomationCenter";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import { HomepageContentManagement } from "./pages/admin/HomepageContentManagement";
import { HomepagePreview } from "./pages/admin/HomepagePreview";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { CompletedOnboardingGuard } from "./components/CompletedOnboardingGuard";
import MyMessages from "./pages/MyMessages";
import MyMeetings from "./pages/MyMeetings";

import SupplierProductsView from "./pages/SupplierProducts";
import SupplierReviews from "./pages/SupplierReviews";
import AppExclusive from "./pages/AppExclusive";
import Accessibility from "./pages/Accessibility";
import Terms from "./pages/Terms";
import Inspiration from "./pages/Inspiration";
import PhotoDetail from "./pages/PhotoDetail";
import Ideabooks from "./pages/Ideabooks";
import IdeabookDetail from "./pages/IdeabookDetail";
import AdminInspiration from "./pages/admin/AdminInspiration";
import PublicSupplierProfile from "./pages/PublicSupplierProfile";
import PublicProductView from "./pages/PublicProductView";
import PublicHomepage from "./pages/PublicHomepage";
import Welcome from "./pages/Welcome";
import { SiteFooter } from "./components/SiteFooter";
import { useGuestMode } from "./hooks/useGuestMode";
import { isPublicRoute } from "./utils/publicRoutes";

// Wrapper for onboarding routes that redirects guests to home
const OnboardingRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGuestMode } = useGuestMode();
  
  // In guest mode, redirect to home
  if (isGuestMode) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper for public routes that can be accessed in guest mode
const PublicRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGuestMode } = useGuestMode();
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }
  
  // If in guest mode OR the route is public, render directly without auth checks
  if (isGuestMode || isPublicRoute(location.pathname)) {
    return <>{children}</>;
  }
  
  // If authenticated user, render with protection
  if (user) {
    return (
      <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
        <OnboardingGuard>
          {children}
        </OnboardingGuard>
      </ProtectedRoute>
    );
  }
  
  // For non-guest, non-authenticated users on protected routes, redirect to auth
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

// Wrapper for homepage that handles guest mode vs authenticated mode vs new visitors
const HomeWrapper: React.FC = () => {
  const { isGuestMode } = useGuestMode();
  const { user, loading } = useAuth();
  
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }
  
  // If in guest mode, show public homepage
  if (isGuestMode) {
    return <PublicHomepage />;
  }
  
  // If authenticated user, show protected homepage
  if (user) {
    return (
      <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
        <OnboardingGuard>
          <Index />
        </OnboardingGuard>
      </ProtectedRoute>
    );
  }
  
  // For new visitors (not authenticated, not in guest mode), show welcome page
  // Check if user has previously chosen a path (to avoid showing welcome every time)
  const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
  if (!hasSeenWelcome) {
    sessionStorage.setItem('hasSeenWelcome', 'true');
    return <Welcome />;
  }
  
  // Default: redirect to auth for returning users
  return <Navigate to="/auth" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SecurityMiddleware>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug') && <QueryDebugOverlay />}
              <div className="min-h-screen bg-white">
              <Routes>
                {/* Home page - supports guest mode and welcome for new visitors */}
                <Route path="/" element={<HomeWrapper />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/app-exclusive" element={<AppExclusive />} />
                <Route path="/auth" element={
                  <RedirectIfAuthenticated>
                    <Auth />
                  </RedirectIfAuthenticated>
                } />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/registration" element={<Registration />} />
                {/* Redirect /login to /auth for consistency */}
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PublicRouteWrapper><PrivacyPolicy /></PublicRouteWrapper>} />
                <Route path="/accessibility" element={<PublicRouteWrapper><Accessibility /></PublicRouteWrapper>} />
                <Route path="/terms" element={<PublicRouteWrapper><Terms /></PublicRouteWrapper>} />
                <Route path="/notifications" element={<Notifications />} />
                {/* Role picker - protected from completed users, only for new users */}
                <Route path="/onboarding/role-picker" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <RolePicker />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                
                {/* Client onboarding routes - protected from completed users only */}
                <Route path="/onboarding/welcome" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <OnboardingWelcome />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/home-details" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <OnboardingHomeDetails />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/project-planning" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <OnboardingProjectPlanning />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/documents" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <OnboardingDocuments />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/interests" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <OnboardingInterests />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                
                {/* Supplier onboarding routes - protected from completed users only */}
                <Route path="/onboarding/supplier-welcome" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <SupplierWelcome />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/supplier-company-info" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <SupplierCompanyInfo />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/supplier-branding" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <SupplierBranding />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/supplier-products" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <SupplierProducts />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/onboarding/supplier-summary" element={
                  <OnboardingRouteWrapper>
                    <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                      <CompletedOnboardingGuard>
                        <SupplierSummary />
                      </CompletedOnboardingGuard>
                    </ProtectedRoute>
                  </OnboardingRouteWrapper>
                } />
                <Route path="/supplier/dashboard" element={
                  <OnboardingGuard role="supplier">
                    <SupplierDashboardNew />
                  </OnboardingGuard>
                } />
                {/* Legacy route redirect */}
                <Route path="/supplier-dashboard" element={<Navigate to="/supplier/dashboard" replace />} />
                <Route path="/supplier/leads" element={
                  <OnboardingGuard role="supplier">
                    <SupplierLeadManagement />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/crm" element={
                  <OnboardingGuard role="supplier">
                    <SupplierCRM />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/catalog" element={
                  <OnboardingGuard role="supplier">
                    <ProductCatalog />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/quotes" element={
                  <OnboardingGuard role="supplier">
                    <QuoteBuilder />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/proposals" element={
                  <OnboardingGuard role="supplier">
                    <ProposalBuilder />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/orders" element={
                  <OnboardingGuard role="supplier">
                    <SupplierOrders />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/orders/:orderId/change-orders" element={
                  <OnboardingGuard role="supplier">
                    <OrderChangeOrders />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/change-orders/:id" element={
                  <OnboardingGuard role="supplier">
                    <ChangeOrderDetails />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/notifications" element={
                  <OnboardingGuard role="supplier">
                    <SupplierNotifications />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/notification-settings" element={
                  <OnboardingGuard role="supplier">
                    <NotificationSettings />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/analytics" element={
                  <OnboardingGuard role="supplier">
                    <SupplierAnalytics />
                  </OnboardingGuard>
                } />
                <Route path="/supplier/files" element={
                  <OnboardingGuard role="supplier">
                    <SupplierFiles />
                  </OnboardingGuard>
                } />
                <Route path="/quotes/:quoteId" element={<QuoteView />} />
                <Route path="/sign/:token" element={<ProposalSignature />} />
                
                {/* Public routes - accessible in guest mode */}
                <Route path="/search" element={<PublicRouteWrapper><Search /></PublicRouteWrapper>} />
                <Route path="/favorites" element={<ProtectedRoute allowedRoles={['client', 'supplier']}><Favorites /></ProtectedRoute>} />
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['client', 'supplier']}>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:orderId/status" element={<OrderStatus />} />
                <Route path="/orders/:orderId/tracking" element={<LiveDeliveryTracking />} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}><Profile /></ProtectedRoute>} />
                <Route path="/top-suppliers" element={<PublicRouteWrapper><TopSuppliers /></PublicRouteWrapper>} />
                <Route path="/new-suppliers" element={<PublicRouteWrapper><NewSuppliers /></PublicRouteWrapper>} />
                <Route path="/hot-now" element={<PublicRouteWrapper><HotNow /></PublicRouteWrapper>} />
                <Route path="/local-deals" element={<PublicRouteWrapper><LocalDeals /></PublicRouteWrapper>} />
                <Route path="/popular-now" element={<PublicRouteWrapper><PopularNow /></PublicRouteWrapper>} />
                <Route path="/supplier/:id" element={<PublicRouteWrapper><SupplierProfile /></PublicRouteWrapper>} />
                <Route path="/supplier/:id/products" element={<PublicRouteWrapper><SupplierProductsView /></PublicRouteWrapper>} />
                <Route path="/supplier/:id/reviews" element={<PublicRouteWrapper><SupplierReviews /></PublicRouteWrapper>} />
                <Route path="/supplier/profile/preview" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierProfilePreview />
                  </ProtectedRoute>
                } />
                <Route path="/category/:category/suppliers" element={<PublicRouteWrapper><CategorySuppliers /></PublicRouteWrapper>} />
                <Route path="/support" element={<PublicRouteWrapper><Support /></PublicRouteWrapper>} />
                <Route path="/support/chat/:id" element={<SupportChat />} />
                <Route path="/complaint/:orderId" element={<ComplaintForm />} />
                <Route path="/support/complaint/:id" element={<ComplaintDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/supplier/settings" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={<PublicRouteWrapper><FAQ /></PublicRouteWrapper>} />
                <Route path="/notifications-preferences" element={<NotificationPreferences />} />
                <Route path="/supplier/notifications-preferences" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <NotificationPreferences />
                  </ProtectedRoute>
                } />
                <Route path="/my-messages" element={
                  <ProtectedRoute allowedRoles={['client', 'supplier']}>
                    <MyMessages />
                  </ProtectedRoute>
                } />
                <Route path="/my-meetings" element={
                  <ProtectedRoute allowedRoles={['client', 'supplier']}>
                    <MyMeetings />
                  </ProtectedRoute>
                } />
                <Route path="/saved-suppliers" element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <Navigate to="/favorites" replace />
                  </ProtectedRoute>
                } />
                
                {/* Public supplier routes - no authentication required */}
                <Route path="/s/:slug" element={<PublicRouteWrapper><PublicSupplierProfile /></PublicRouteWrapper>} />
                <Route path="/s/:slug/p/:productId" element={<PublicRouteWrapper><PublicProductView /></PublicRouteWrapper>} />
                
                {/* Inspiration routes - public */}
                <Route path="/inspiration" element={<PublicRouteWrapper><Inspiration /></PublicRouteWrapper>} />
                <Route path="/inspiration/photo/:id" element={<PublicRouteWrapper><PhotoDetail /></PublicRouteWrapper>} />
                <Route path="/ideabooks" element={
                  <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                    <Ideabooks />
                  </ProtectedRoute>
                } />
                <Route path="/ideabooks/:id" element={<IdeabookDetail />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLayout><AdminLogin /></AdminLayout>} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminDashboard /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={<Navigate to="/admin/customers" replace />} />
                <Route path="/admin/customers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><CustomerManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/suppliers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><SupplierManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminOrderManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/quotes" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><QuoteManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/complaints" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><ComplaintManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/categories" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><CategoryManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/support-chat" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><SupportChatManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/leads" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><LeadManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/content" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><ContentManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reviews" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><ReviewsModeration /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdvancedReports /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/automation" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AutomationCenter /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/permissions" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><PermissionsManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/homepage-content" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><HomepageContentManagement /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/homepage-content/preview" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><HomepagePreview /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/inspiration" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminInspiration /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><AdminAnalytics /></AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout><SystemSettings /></AdminLayout>
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
                <ConditionalNavigation />
                <SiteFooter />
              </div>
            </TooltipProvider>
          </SecurityMiddleware>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const ConditionalNavigation = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const isSupplierRoute = location.pathname.startsWith('/supplier/') || location.pathname === '/supplier-dashboard';
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const isOnboardingRoute = location.pathname.startsWith('/onboarding/') || location.pathname === '/registration' || location.pathname === '/auth';
  const isSupportRoute = location.pathname.startsWith('/support/');
  
  // Don't show navigation during onboarding, auth flows, support chat, or admin panel
  if (isOnboardingRoute || isSupportRoute || isAdminRoute) {
    return null;
  }
  
  // Show supplier navigation only if user is actually a supplier and on supplier routes
  if (isSupplierRoute && profile?.role === 'supplier') {
    return <SupplierBottomNavigation />;
  }
  
  // Show regular navigation for all other cases (including when non-suppliers access public supplier routes)
  return <BottomNavigation />;
};

export default App;
