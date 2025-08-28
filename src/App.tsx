
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { SecurityMiddleware } from "./components/SecurityMiddleware";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SupplierBottomNavigation } from "@/components/SupplierBottomNavigation";
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
import SupplierAnalytics from "./pages/supplier/Analytics";
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
import { SiteFooter } from "./components/SiteFooter";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SecurityMiddleware>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app-exclusive" element={<AppExclusive />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/registration" element={<Registration />} />
                {/* Redirect /login to /auth for consistency */}
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/onboarding/welcome" element={
                  <CompletedOnboardingGuard>
                    <OnboardingWelcome />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/home-details" element={
                  <CompletedOnboardingGuard>
                    <OnboardingHomeDetails />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/project-planning" element={
                  <CompletedOnboardingGuard>
                    <OnboardingProjectPlanning />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/documents" element={
                  <CompletedOnboardingGuard>
                    <OnboardingDocuments />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/interests" element={
                  <CompletedOnboardingGuard>
                    <OnboardingInterests />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/supplier-welcome" element={
                  <CompletedOnboardingGuard>
                    <SupplierWelcome />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/supplier-company-info" element={
                  <CompletedOnboardingGuard>
                    <SupplierCompanyInfo />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/supplier-branding" element={
                  <CompletedOnboardingGuard>
                    <SupplierBranding />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/supplier-products" element={
                  <CompletedOnboardingGuard>
                    <SupplierProducts />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/onboarding/supplier-summary" element={
                  <CompletedOnboardingGuard>
                    <SupplierSummary />
                  </CompletedOnboardingGuard>
                } />
                <Route path="/supplier-dashboard" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierDashboard />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/dashboard" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierDashboardNew />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/leads" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierLeadManagement />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/crm" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierCRM />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/catalog" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <ProductCatalog />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/quotes" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <QuoteBuilder />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/proposals" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <ProposalBuilder />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/orders" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierOrders />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/notifications" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierNotifications />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/supplier/analytics" element={
                  <OnboardingGuard>
                    <ProtectedRoute allowedRoles={['supplier']}>
                      <SupplierAnalytics />
                    </ProtectedRoute>
                  </OnboardingGuard>
                } />
                <Route path="/quotes/:quoteId" element={<QuoteView />} />
                <Route path="/search" element={<Search />} />
                <Route path="/favorites" element={<ProtectedRoute allowedRoles={['client']}><Favorites /></ProtectedRoute>} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId/status" element={<OrderStatus />} />
                <Route path="/orders/:orderId/tracking" element={<LiveDeliveryTracking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/top-suppliers" element={<TopSuppliers />} />
                <Route path="/new-suppliers" element={<NewSuppliers />} />
                <Route path="/hot-now" element={<HotNow />} />
                <Route path="/local-deals" element={<LocalDeals />} />
                <Route path="/popular-now" element={<PopularNow />} />
                <Route path="/supplier/:id" element={<SupplierProfile />} />
                <Route path="/supplier/:id/products" element={<SupplierProductsView />} />
                <Route path="/supplier/:id/reviews" element={<SupplierReviews />} />
                <Route path="/supplier/profile/preview" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierProfilePreview />
                  </ProtectedRoute>
                } />
                <Route path="/category/:category/suppliers" element={<CategorySuppliers />} />
                <Route path="/support" element={<Support />} />
                <Route path="/support/chat/:id" element={<SupportChat />} />
                <Route path="/complaint/:orderId" element={<ComplaintForm />} />
                <Route path="/support/complaint/:id" element={<ComplaintDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/supplier/settings" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/notifications-preferences" element={<NotificationPreferences />} />
                <Route path="/supplier/notifications-preferences" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <NotificationPreferences />
                  </ProtectedRoute>
                } />
                <Route path="/my-messages" element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <MyMessages />
                  </ProtectedRoute>
                } />
                <Route path="/my-meetings" element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <MyMeetings />
                  </ProtectedRoute>
                } />
                <Route path="/saved-suppliers" element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <Navigate to="/favorites" replace />
                  </ProtectedRoute>
                } />
                
                {/* Inspiration routes */}
                <Route path="/inspiration" element={<Inspiration />} />
                <Route path="/inspiration/photo/:id" element={<PhotoDetail />} />
                <Route path="/ideabooks" element={
                  <ProtectedRoute allowedRoles={['client', 'supplier', 'admin']}>
                    <Ideabooks />
                  </ProtectedRoute>
                } />
                <Route path="/ideabooks/:id" element={<IdeabookDetail />} />
                
                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLayout><AdminLogin /></AdminLayout>} />
                <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                <Route path="/admin/suppliers" element={<AdminLayout><SupplierManagement /></AdminLayout>} />
                <Route path="/admin/orders" element={<AdminLayout><AdminOrderManagement /></AdminLayout>} />
                <Route path="/admin/quotes" element={<AdminLayout><QuoteManagement /></AdminLayout>} />
                <Route path="/admin/complaints" element={<AdminLayout><ComplaintManagement /></AdminLayout>} />
                <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
                <Route path="/admin/support-chat" element={<AdminLayout><SupportChatManagement /></AdminLayout>} />
                <Route path="/admin/leads" element={<AdminLayout><LeadManagement /></AdminLayout>} />
                <Route path="/admin/content" element={<AdminLayout><ContentManagement /></AdminLayout>} />
                <Route path="/admin/reviews" element={<AdminLayout><ReviewsModeration /></AdminLayout>} />
                <Route path="/admin/reports" element={<AdminLayout><AdvancedReports /></AdminLayout>} />
                <Route path="/admin/automation" element={<AdminLayout><AutomationCenter /></AdminLayout>} />
                <Route path="/admin/permissions" element={<AdminLayout><PermissionsManagement /></AdminLayout>} />
                <Route path="/admin/homepage-content" element={<AdminLayout><HomepageContentManagement /></AdminLayout>} />
                <Route path="/admin/homepage-content/preview" element={<AdminLayout><HomepagePreview /></AdminLayout>} />
                <Route path="/admin/inspiration" element={<AdminLayout><AdminInspiration /></AdminLayout>} />
                <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><SystemSettings /></AdminLayout>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
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
