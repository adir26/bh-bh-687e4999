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
import { HeroSection } from '@/components/HeroSection';
import { AdBanner } from '@/components/AdBanner';
import { SectionTitle } from '@/components/SectionTitle';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { QuickSelection } from '@/components/QuickSelection';
import { CategorySection } from '@/components/CategorySection';
import { SupplierSection } from '@/components/SupplierSection';
import { BottomCTA } from '@/components/BottomCTA';
import { OnboardingStatusBanner } from '@/components/OnboardingStatusBanner';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { PopularCategories } from '@/components/PopularCategories';
import { GuestBanner } from '@/components/GuestBanner';
import { LoginModal } from '@/components/modals/LoginModal';
import { Supplier } from '@/data/suppliers';
import { showToast } from '@/utils/toast';

// Import local images - BONIMPO cohesive design system
import kitchenImg from '@/assets/category-icon-kitchen.jpg';
import bathroomImg from '@/assets/category-icon-bathroom.jpg';
import furnitureImg from '@/assets/category-icon-furniture.jpg';
import acImg from '@/assets/category-icon-ac.jpg';
import renovationImg from '@/assets/category-icon-renovation.jpg';
import movingImg from '@/assets/category-icon-moving.jpg';
import mortgageImg from '@/assets/category-icon-mortgage.jpg';
import loansImg from '@/assets/category-icon-loans.jpg';
import exclusiveImg from '@/assets/category-icon-exclusive.jpg';
import hotImg from '@/assets/category-icon-hot.jpg';
import newImg from '@/assets/category-icon-new.jpg';
import topImg from '@/assets/category-icon-top.jpg';
import localDealsImg from '@/assets/category-local-deals.jpg';
import exclusiveDealsImg from '@/assets/category-exclusive-deals.jpg';
import hotNowImg from '@/assets/category-hot-now.jpg';
import inspirationKitchenImg from '@/assets/inspiration-kitchen.jpg';
import inspirationBathroomImg from '@/assets/inspiration-bathroom.jpg';
import inspirationLivingImg from '@/assets/inspiration-living.jpg';
import inspirationBalconyImg from '@/assets/inspiration-balcony.jpg';
const UnifiedHomepage = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    isGuestMode,
    showLoginModal,
    setShowLoginModal,
    attemptedAction,
    setAttemptedAction
  } = useGuestMode();
  
  const {
    logEvent
  } = useAppEvents();
  const queryClient = useQueryClient();
  const isGuest = !user || isGuestMode;

  // Log app_open event when component mounts
  useEffect(() => {
    logEvent('app_open', {
      page: 'home',
      isGuest
    });
  }, []);

  // Load suppliers from database
  const {
    data: mortgageAdvisorsData = []
  } = useCategorySuppliers('mortgage-advisors');
  const {
    data: movingServicesData = []
  } = useCategorySuppliers('moving-services');
  const {
    data: homeLoansData = []
  } = useCategorySuppliers('home-loans');

  // Fetch featured suppliers from CMS
  const {
    data: homepageContent = []
  } = useHomepagePublicContent('web');

  // Extract featured supplier IDs from CMS
  const featuredSupplierIds = homepageContent.filter(item => item.section_type === 'supplier_cards' && item.item_link_type === 'supplier' && item.item_link_target_id).map(item => item.item_link_target_id!);

  // Fetch full supplier details from database
  const {
    data: featuredSuppliers = [],
    isLoading: isFeaturedLoading
  } = useFeaturedSuppliers(featuredSupplierIds);

  // Polling for real-time updates in development
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    if (!isDev) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ['featured-suppliers']
      });
      queryClient.invalidateQueries({
        queryKey: ['homepage-public-content']
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Quick selection data - using BONIMPO cohesive icons
  const quickSelectionItems = [{
    id: '1',
    title: 'מטבחים',
    image: kitchenImg
  }, {
    id: '2',
    title: 'בלעדי לאפליקציה',
    image: exclusiveImg
  }, {
    id: '3',
    title: 'ספקים חדשים',
    image: newImg
  }, {
    id: '4',
    title: 'חם עכשיו',
    image: hotImg
  }, {
    id: '5',
    title: 'המובילים בבונים פה',
    image: topImg
  }];

  // Kitchen categories data - using inspiration gallery images
  const kitchenCategories = [{
    id: '1',
    title: 'מטבחים מעוצבים',
    subtitle: 'מטבחים',
    image: inspirationKitchenImg
  }, {
    id: '2',
    title: 'חדרי רחצה',
    subtitle: 'חדרי רחצה',
    image: inspirationBathroomImg
  }, {
    id: '3',
    title: 'סלון ומגורים',
    subtitle: 'סלון',
    image: inspirationLivingImg
  }, {
    id: '4',
    title: 'מרפסות וגינות',
    subtitle: 'גינות',
    image: inspirationBalconyImg
  }, {
    id: '5',
    title: 'שיפוצים כלליים',
    subtitle: 'שיפוצים',
    image: renovationImg
  }];

  // Exclusive deals data - using cohesive BONIMPO images
  const exclusiveDeals = [{
    id: '1',
    title: 'מבצעים בלעדיים',
    subtitle: 'מבצעים',
    image: exclusiveDealsImg
  }, {
    id: '2',
    title: 'הצעות מיוחדות',
    subtitle: 'מבצעים',
    image: exclusiveImg
  }, {
    id: '3',
    title: 'הנחות לזמן מוגבל',
    subtitle: 'מבצעים',
    image: hotNowImg
  }];

  // Local deals data - using cohesive images
  const localDeals = [{
    id: '1',
    title: 'מבצעים מקומיים',
    subtitle: 'מבצעים מקומיים',
    image: localDealsImg
  }, {
    id: '2',
    title: 'הצעות בקרבת מקום',
    subtitle: 'מבצעים מקומיים',
    image: exclusiveDealsImg
  }, {
    id: '3',
    title: 'מבצעי קהילה',
    subtitle: 'מבצעים מקומיים',
    image: inspirationLivingImg
  }];

  // Hot now items data - using cohesive images
  const hotNowItems = [{
    id: '1',
    title: 'מוצרים חמים ביותר',
    subtitle: 'חם עכשיו',
    image: hotNowImg
  }, {
    id: '2',
    title: 'קטגוריות מבוקשות',
    subtitle: 'חם עכשיו',
    image: inspirationKitchenImg
  }, {
    id: '3',
    title: 'ספקים פופולרים',
    subtitle: 'חם עכשיו',
    image: topImg
  }];

  // Trending items data - using cohesive images
  const trendingItems = [{
    id: '1',
    title: 'חמים באזור שלך',
    subtitle: 'פופולרי עכשיו',
    image: localDealsImg
  }, {
    id: '2',
    title: 'מבצעים מיוחדים',
    subtitle: 'פופולרי עכשיו',
    image: exclusiveDealsImg
  }, {
    id: '3',
    title: 'המבוקשים ביותר',
    subtitle: 'פופולרי עכשיו',
    image: hotNowImg
  }];

  // Get suppliers from database for each category
  const {
    data: kitchenSuppliers = []
  } = useCategorySuppliers('kitchens');
  const {
    data: furnitureSuppliers = []
  } = useCategorySuppliers('furniture');
  const {
    data: airConditioningSuppliers = []
  } = useCategorySuppliers('air-conditioning');
  const {
    data: renovationSuppliers = []
  } = useCategorySuppliers('renovation');

  // Event handlers
  const handleQuickSelectionClick = (item: any) => {
    if (item.id === '1') navigate('/category/kitchens/suppliers');else if (item.id === '2') navigate('/app-exclusive');else if (item.id === '3') navigate('/new-suppliers');else if (item.id === '4') navigate('/hot-now');else if (item.id === '5') navigate('/top-suppliers');
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
  const handleHeroCTA = () => {
    if (isGuest) {
      setAttemptedAction('start_project');
      setShowLoginModal(true);
    } else {
      navigate('/onboarding/welcome');
    }
  };
  const handleAdClick = () => {
    showToast.comingSoon('פרטי המבצע');
  };
  const handleBottomCTA = () => {
    if (isGuest) {
      setAttemptedAction('start_project');
      setShowLoginModal(true);
    } else {
      navigate('/onboarding/welcome');
    }
  };

  // Dynamic content based on auth state
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'אורח';
  const ctaText = isGuest ? 'הצטרפו חינם' : 'בואו נתחיל';
  const ctaHref = isGuest ? '/auth' : '/onboarding/welcome';
  return <div className="flex w-full min-h-screen flex-col items-center bg-background">
      {/* Guest Banner - Only for guests */}
      {isGuest && <GuestBanner />}
      
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center bg-muted/30 pb-nav-safe">
        <div className="flex flex-col items-center w-full">
          <Header userName={isGuest ? undefined : userName} />
          
          {/* Onboarding Status Banner - Only for authenticated users */}
          {!isGuest && <OnboardingStatusBanner />}
          
          {/* Hero Section */}
          <HeroSection href={ctaHref} onCTAClick={handleHeroCTA} showCTA={isGuest} />
        
          {/* Search Section with Autocomplete */}
          <div className="w-full px-0 py-4">
            <SearchAutocomplete 
              placeholder="חפש ספקים וקטגוריות..."
              className="w-full"
            />
          </div>

          <div className="w-full">
            <SectionTitle title="בחירה מהירה" />
            <QuickSelection items={quickSelectionItems} onItemClick={handleQuickSelectionClick} />
          </div>

          {/* Popular Categories Section */}
          <div className="w-full">
            <SectionTitleWithButton title="קטגוריות נפוצות" buttonText="כל הקטגוריות" onButtonClick={() => navigate('/categories')} />
            <PopularCategories />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="מטבחים" buttonText="לכל הספקים" onButtonClick={() => handleAllSuppliersClick('kitchens')} />
            <CategorySection items={kitchenCategories} onItemClick={handleCategoryClick} fixedWidth={true} />
          </div>

          <div className="w-full">
            <SectionTitle title="בלעדי לבונים-פה" />
            <CategorySection items={exclusiveDeals} onItemClick={handleCategoryClick} />
          </div>

          {/* Featured Suppliers from CMS */}
          <div className="w-full">
            <SectionTitleWithButton title="ספקים מובילים" buttonText="לכל הספקים" onButtonClick={() => navigate('/top-suppliers')} />
            {isFeaturedLoading ? <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({
              length: 3
            }).map((_, i) => <div key={i} className="flex-shrink-0 w-64 h-32 bg-muted/50 animate-pulse rounded-lg" />)}
              </div> : featuredSuppliers.length > 0 ? <SupplierSection suppliers={featuredSuppliers} onSupplierClick={handleSupplierClick} /> : <div className="p-8 text-center text-muted-foreground border rounded-lg">
                אין ספקים מובילים להצגה כרגע
              </div>}
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="ריהוט" buttonText="לכל הספקים" onButtonClick={() => handleAllSuppliersClick('furniture')} />
            <CategorySection items={furnitureSuppliers.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo
          }))} onItemClick={item => handleSupplierClick(furnitureSuppliers.find(s => s.id === item.id)!)} />
          </div>

          {/* Ad Banner */}
          <AdBanner onAdClick={handleAdClick} />

          <div className="w-full">
            <SectionTitleWithButton title="מיזוג אוויר" buttonText="לכל הספקים" onButtonClick={() => handleAllSuppliersClick('air-conditioning')} />
            <CategorySection items={airConditioningSuppliers.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo
          }))} onItemClick={item => handleSupplierClick(airConditioningSuppliers.find(s => s.id === item.id)!)} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="שיפוצים" buttonText="לכל הספקים" onButtonClick={() => handleAllSuppliersClick('renovation')} />
            <CategorySection items={renovationSuppliers.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo
          }))} onItemClick={item => handleSupplierClick(renovationSuppliers.find(s => s.id === item.id)!)} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="יועצי משכנתאות וביטוח" buttonText="לכל היועצים" onButtonClick={() => handleAllSuppliersClick('mortgage-advisors')} />
            <CategorySection items={mortgageAdvisorsData.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo,
            size: 'medium' as const
          }))} onItemClick={item => {
            const supplier = mortgageAdvisorsData.find(s => s.id === item.id);
            if (supplier) handleSupplierClick(supplier);
          }} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="הובלות" buttonText="לכל חברות ההובלה" onButtonClick={() => handleAllSuppliersClick('moving-services')} />
            <CategorySection items={movingServicesData.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo,
            size: 'medium' as const
          }))} onItemClick={item => {
            const supplier = movingServicesData.find(s => s.id === item.id);
            if (supplier) handleSupplierClick(supplier);
          }} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="הלוואות" buttonText="לכל ספקי ההלוואות" onButtonClick={() => handleAllSuppliersClick('home-loans')} />
            <CategorySection items={homeLoansData.map(supplier => ({
            id: supplier.id,
            title: supplier.name,
            subtitle: supplier.tagline,
            image: supplier.logo,
            size: 'medium' as const
          }))} onItemClick={item => {
            const supplier = homeLoansData.find(s => s.id === item.id);
            if (supplier) handleSupplierClick(supplier);
          }} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="מבצעים בסביבה" buttonText="לכל המבצעים" onButtonClick={() => navigate('/local-deals')} />
            <CategorySection items={localDeals} onItemClick={handleCategoryClick} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="חם עכשיו" buttonText="לכל הפרויקטים" onButtonClick={() => navigate('/hot-now')} />
            <CategorySection items={hotNowItems} onItemClick={handleCategoryClick} />
          </div>

          <div className="w-full">
            <SectionTitleWithButton title="פופולרי עכשיו" buttonText="לכל הספקים" onButtonClick={() => navigate('/popular-now')} />
            <CategorySection items={trendingItems} onItemClick={handleCategoryClick} />
          </div>
          
          {/* Bottom CTA */}
          <BottomCTA title={isGuest ? "מוכנים להתחיל?" : "מוכנים להתחיל את הפרויקט שלכם?"} buttonText={ctaText} href={ctaHref} onButtonClick={handleBottomCTA} show={true} className="px-0 py-[28px] mx-0" />
        </div>
      </main>

      {/* Login Modal for Guest Actions */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} attemptedAction={attemptedAction} />
    </div>;
};
export default UnifiedHomepage;