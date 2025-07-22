
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import Index from "./pages/Index";
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
import LeadManagement from "./pages/supplier/LeadManagement";
import ProductCatalog from "./pages/supplier/ProductCatalog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/dashboard" element={<SupplierDashboardNew />} />
            <Route path="/supplier/leads" element={<LeadManagement />} />
            <Route path="/supplier/catalog" element={<ProductCatalog />} />
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
            <Route path="/category/:category/suppliers" element={<CategorySuppliers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
