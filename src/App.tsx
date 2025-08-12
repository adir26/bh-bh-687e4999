
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SupplierBottomNavigation } from "@/components/SupplierBottomNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import OrderManagement from "./pages/supplier/OrderManagement";
import SupplierNotifications from "./pages/supplier/Notifications";
import SupplierAnalytics from "./pages/supplier/Analytics";
import SupplierCRM from "./pages/supplier/CRM";
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
import { AdminLayout } from "./components/admin/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MyMessages from "./pages/MyMessages";
import MyMeetings from "./pages/MyMeetings";
import SavedSuppliers from "./pages/SavedSuppliers";
import SupplierProductsView from "./pages/SupplierProducts";
import SupplierReviews from "./pages/SupplierReviews";
import AppExclusive from "./pages/AppExclusive";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app-exclusive" element={<AppExclusive />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
                <Route path="/onboarding/home-details" element={<OnboardingHomeDetails />} />
                <Route path="/onboarding/project-planning" element={<OnboardingProjectPlanning />} />
                <Route path="/onboarding/documents" element={<OnboardingDocuments />} />
                <Route path="/onboarding/interests" element={<OnboardingInterests />} />
                <Route path="/onboarding/supplier-welcome" element={<SupplierWelcome />} />
                <Route path="/onboarding/supplier-company-info" element={<SupplierCompanyInfo />} />
                <Route path="/onboarding/supplier-branding" element={<SupplierBranding />} />
                <Route path="/onboarding/supplier-products" element={<SupplierProducts />} />
                <Route path="/onboarding/supplier-summary" element={<SupplierSummary />} />
                <Route path="/supplier-dashboard" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/dashboard" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierDashboardNew />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/leads" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierLeadManagement />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/crm" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierCRM />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/catalog" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <ProductCatalog />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/quotes" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <QuoteBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/proposals" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <ProposalBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/orders" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <OrderManagement />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/notifications" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierNotifications />
                  </ProtectedRoute>
                } />
                <Route path="/supplier/analytics" element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={<Search />} />
                <Route path="/favorites" element={<Favorites />} />
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
                    <SavedSuppliers />
                  </ProtectedRoute>
                } />
                
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
                <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><SystemSettings /></AdminLayout>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ConditionalNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const ConditionalNavigation = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const isSupplierRoute = location.pathname.startsWith('/supplier/') || location.pathname === '/supplier-dashboard';
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const isOnboardingRoute = location.pathname.startsWith('/onboarding/') || location.pathname === '/registration' || location.pathname === '/login' || location.pathname === '/auth';
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
