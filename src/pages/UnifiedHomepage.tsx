import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useCategorySuppliers } from '@/hooks/useCategorySuppliers';
import { useAppEvents } from '@/hooks/useAppEvents';
import { useHomepagePublicContent } from '@/hooks/useHomepageCMS';
import { useFeaturedSuppliers } from '@/hooks/useFeaturedSuppliers';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { QuickSelection } from '@/components/QuickSelection';
import { CategorySection } from '@/components/CategorySection';
import { SupplierSection } from '@/components/SupplierSection';
import { OnboardingStatusBanner } from '@/components/OnboardingStatusBanner';
import { SearchInput } from '@/components/ui/search-input';
import { PopularCategories } from '@/components/PopularCategories';
import { GuestBanner } from '@/components/GuestBanner';
import { LoginModal } from '@/components/modals/LoginModal';
import { PremiumHero } from '@/components/home/PremiumHero';
import { TrustSection } from '@/components/home/TrustSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { CTASection } from '@/components/home/CTASection';
import { PremiumFooter } from '@/components/home/PremiumFooter';
import { Supplier } from '@/data/suppliers';
import { showToast } from '@/utils/toast';

// Import local images
import kitchenDesignImg from '@/assets/kitchen-design.jpg';
import kitchenAccessoriesImg from '@/assets/kitchen-accessories.jpg';
import kitchenModernImg from '@/assets/kitchen-modern.jpg';
import kitchenHardwareImg from '@/assets/kitchen-hardware.jpg';
import kitchenInstallationImg from '@/assets/kitchen-installation.jpg';

const UnifiedHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGuestMode, showLoginModal, setShowLoginModal, setAttemptedAction } = useGuestMode();
  const [searchQuery, setSearchQuery] = useState('');
  const { logEvent } = useAppEvents();
  const queryClient = useQueryClient();

  const isGuest = !user || isGuestMode;

  // Log app_open event when component mounts
  useEffect(() => {
    logEvent('app_open', { page: 'home', isGuest });
  }, []);
  
  // Load suppliers from database
  const { data: mortgageAdvisorsData = [] } = useCategorySuppliers('mortgage-advisors');
  const { data: movingServicesData = [] } = useCategorySuppliers('moving-services');
  const { data: homeLoansData = [] } = useCategorySuppliers('home-loans');

  // Fetch featured suppliers from CMS
  const { data: homepageContent = [] } = useHomepagePublicContent('web');
  
  // Extract featured supplier IDs from CMS
  const featuredSupplierIds = homepageContent
    .filter(
      item => item.section_type === 'supplier_cards' && 
              item.item_link_type === 'supplier' &&
              item.item_link_target_id
    )
    .map(item => item.item_link_target_id!);

  // Fetch full supplier details from database
  const { data: featuredSuppliers = [], isLoading: isFeaturedLoading } = useFeaturedSuppliers(featuredSupplierIds);

  // Get suppliers from database for each category
  const { data: kitchenSuppliers = [] } = useCategorySuppliers('kitchens');
  const { data: furnitureSuppliers = [] } = useCategorySuppliers('furniture');
  const { data: airConditioningSuppliers = [] } = useCategorySuppliers('air-conditioning');
  const { data: renovationSuppliers = [] } = useCategorySuppliers('renovation');

  // Quick selection data
  const quickSelectionItems = [
    {
      id: '1',
      title: 'מטבחים',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/412b6930986355e60bd9ab81c33874aa5793c909?width=256'
    },
    {
      id: '2',
      title: 'בלעדי לאפליקציה',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/79cf482cde57d1401ddfb44ac7f4407b97b7a749?width=256'
    },
    {
      id: '3',
      title: 'ספקים חדשים',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/0e229886b939e7efe2eaf0ec52f96dd014bce76a?width=256'
    },
    {
      id: '4',
      title: 'חם עכשיו',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=256'
    },
    {
      id: '5',
      title: 'המובילים בבונים פה',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=256'
    }
  ];

  // Kitchen categories data
  const kitchenCategories = [
    { id: '1', title: 'מטבחים מעוצבים', subtitle: 'מטבחים', image: kitchenModernImg },
    { id: '2', title: 'אבזור למטבח', subtitle: 'מטבחים', image: kitchenHardwareImg },
    { id: '3', title: 'התקנת מטבחים', subtitle: 'מטבחים', image: kitchenInstallationImg },
    { id: '4', title: 'עיצוב מטבחים', subtitle: 'מטבחים', image: kitchenDesignImg },
    { id: '5', title: 'אביזרי מטבח', subtitle: 'מטבחים', image: kitchenAccessoriesImg }
  ];

  // Exclusive deals data
  const exclusiveDeals = [
    { id: '1', title: 'מבצעים בלעדיים', subtitle: 'מבצעים', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=480&h=480&fit=crop' },
    { id: '2', title: 'הצעות מיוחדות', subtitle: 'מבצעים', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop' },
    { id: '3', title: 'הנחות לזמן מוגבל', subtitle: 'מבצעים', image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=480&h=480&fit=crop' }
  ];

  // Event handlers
  const handleQuickSelectionClick = (item: any) => {
    if (item.id === '1') navigate('/category/kitchens/suppliers');
    else if (item.id === '2') navigate('/app-exclusive');
    else if (item.id === '3') navigate('/new-suppliers');
    else if (item.id === '4') navigate('/hot-now');
    else if (item.id === '5') navigate('/top-suppliers');
  };

  const handleCategoryClick = (item: any) => {
    const categoryRoutes: Record<string, string> = {
      'מטבחים': '/category/kitchens/suppliers',
      'מבצעים': '/local-deals',
      'ריהוט': '/category/furniture/suppliers',
      'מיזוג': '/category/air-conditioning/suppliers',
      'שיפוצים': '/category/renovation/suppliers',
      'חדרי רחצה': '/category/bathroom/suppliers',
      'חדרי שינה': '/category/bedroom/suppliers',
      'גינות': '/category/garden/suppliers',
      'סלון': '/category/living-room/suppliers',
      'יועצים': '/category/mortgage-advisors/suppliers',
      'הובלות': '/category/moving-services/suppliers',
      'הלוואות': '/category/home-loans/suppliers',
      'מבצעים מקומיים': '/local-deals',
      'חם עכשיו': '/hot-now',
      'פופולרי עכשיו': '/popular-now'
    };
    
    const route = categoryRoutes[item.subtitle];
    if (route) {
      navigate(route);
    } else {
      showToast.comingSoon(`קטגוריה: ${item.title}`);
    }
  };

  const handleSupplierClick = (supplier: Supplier) => {
    if (supplier.slug) {
      navigate(`/s/${supplier.slug}`);
    } else {
      navigate(`/supplier/${supplier.id}`);
    }
  };

  const handleAllSuppliersClick = (category: string) => {
    navigate(`/category/${category}/suppliers`);
  };

  const handleHeroSearch = () => {
    navigate('/search');
  };

  const handleHeroInspiration = () => {
    navigate('/inspiration');
  };

  const handleCTAClick = () => {
    if (isGuest) {
      setAttemptedAction('start_project');
      setShowLoginModal(true);
    } else {
      navigate('/onboarding/welcome');
    }
  };

  const handleFeatureClick = (href: string) => {
    if (isGuest && href === '/auth') {
      setAttemptedAction('start_project');
      setShowLoginModal(true);
    } else {
      navigate(href);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'אורח';

  return (
    <div className="flex w-full min-h-screen flex-col bg-background">
      {/* Guest Banner - Only for guests */}
      {isGuest && <GuestBanner />}
      
      {/* Header */}
      <Header userName={isGuest ? undefined : userName} />
      
      {/* Onboarding Status Banner - Only for authenticated users */}
      {!isGuest && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <OnboardingStatusBanner />
        </div>
      )}
      
      {/* Premium Hero Section */}
      <PremiumHero
        onSearchClick={handleHeroSearch}
        onInspirationClick={handleHeroInspiration}
        isGuest={isGuest}
      />
      
      {/* Trust Section */}
      <TrustSection />
      
      {/* Features Grid */}
      <FeaturesGrid onFeatureClick={handleFeatureClick} />
      
      {/* Main Content */}
      <main className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <SearchInput
              type="text"
              placeholder="חפש ספקים, שירותים ומוצרים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onClear={() => setSearchQuery('')}
              className="text-right rounded-xl shadow-premium-md"
              dir="rtl"
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitle title="בחירה מהירה" />
            <QuickSelection 
              items={quickSelectionItems}
              onItemClick={handleQuickSelectionClick}
            />
          </div>

          {/* Popular Categories Section */}
          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="קטגוריות נפוצות"
              buttonText="כל הקטגוריות"
              onButtonClick={() => navigate('/categories')}
            />
            <PopularCategories />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="מטבחים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('kitchens')}
            />
            <CategorySection 
              items={kitchenCategories} 
              onItemClick={handleCategoryClick}
              fixedWidth={true}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitle title="בלעדי לבונים-פה" />
            <CategorySection 
              items={exclusiveDeals} 
              onItemClick={handleCategoryClick}
            />
          </div>

          {/* Featured Suppliers from CMS */}
          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="ספקים מובילים"
              buttonText="לכל הספקים"
              onButtonClick={() => navigate('/top-suppliers')}
            />
            {isFeaturedLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-32 bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : featuredSuppliers.length > 0 ? (
              <SupplierSection 
                suppliers={featuredSuppliers}
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground border rounded-2xl">
                אין ספקים מובילים להצגה כרגע
              </div>
            )}
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="ריהוט" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('furniture')}
            />
            <CategorySection 
              items={furnitureSuppliers.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo
              }))} 
              onItemClick={(item) => handleSupplierClick(furnitureSuppliers.find(s => s.id === item.id)!)}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="מיזוג אוויר" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('air-conditioning')}
            />
            <CategorySection 
              items={airConditioningSuppliers.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo
              }))} 
              onItemClick={(item) => handleSupplierClick(airConditioningSuppliers.find(s => s.id === item.id)!)}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="שיפוצים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('renovation')}
            />
            <CategorySection 
              items={renovationSuppliers.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo
              }))} 
              onItemClick={(item) => handleSupplierClick(renovationSuppliers.find(s => s.id === item.id)!)}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="יועצי משכנתאות וביטוח" 
              buttonText="לכל היועצים"
              onButtonClick={() => handleAllSuppliersClick('mortgage-advisors')}
            />
            <CategorySection 
              items={mortgageAdvisorsData.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo,
                size: 'medium' as const
              }))}
              onItemClick={(item) => {
                const supplier = mortgageAdvisorsData.find(s => s.id === item.id);
                if (supplier) handleSupplierClick(supplier);
              }}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="הובלות" 
              buttonText="לכל חברות ההובלה"
              onButtonClick={() => handleAllSuppliersClick('moving-services')}
            />
            <CategorySection 
              items={movingServicesData.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo
              }))}
              onItemClick={(item) => {
                const supplier = movingServicesData.find(s => s.id === item.id);
                if (supplier) handleSupplierClick(supplier);
              }}
            />
          </div>

          <div className="w-full mb-12" dir="rtl">
            <SectionTitleWithButton 
              title="הלוואות לדיור" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('home-loans')}
            />
            <CategorySection 
              items={homeLoansData.map(supplier => ({
                id: supplier.id,
                title: supplier.name,
                subtitle: supplier.tagline,
                image: supplier.logo
              }))}
              onItemClick={(item) => {
                const supplier = homeLoansData.find(s => s.id === item.id);
                if (supplier) handleSupplierClick(supplier);
              }}
            />
          </div>
        </div>
      </main>
      
      {/* CTA Section */}
      <CTASection isGuest={isGuest} onCTAClick={handleCTAClick} />
      
      {/* Premium Footer */}
      <PremiumFooter />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default UnifiedHomepage;
