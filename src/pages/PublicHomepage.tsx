import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { CategorySection } from '@/components/CategorySection';
import { SectionTitle } from '@/components/SectionTitle';
import { SupplierSection } from '@/components/SupplierSection';
import { BottomCTA } from '@/components/BottomCTA';
import { GuestModeIndicator } from '@/components/GuestModeIndicator';
import { LoginModal } from '@/components/modals/LoginModal';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useHomepagePublicContent } from '@/hooks/useHomepageCMS';
import { useFeaturedSuppliers } from '@/hooks/useFeaturedSuppliers';
import type { Supplier } from '@/data/suppliers';
import modernKitchenImage from '@/assets/modern-kitchen-hero.jpg';
import luxuryBathroomImage from '@/assets/luxury-bathroom-hero.jpg';
import designerFurnitureImage from '@/assets/designer-furniture-hero.jpg';
import renovationImage from '@/assets/professional-renovation-hero.jpg';

// Sample categories for guest mode
const sampleCategories = [
  {
    id: '1',
    title: 'מטבחים',
    subtitle: 'עיצוב וייצור מטבחים',
    image: modernKitchenImage,
    size: 'medium' as const
  },
  {
    id: '2',
    title: 'חדרי רחצה',
    subtitle: 'אביזרים ועיצוב',
    image: luxuryBathroomImage,
    size: 'medium' as const
  },
  {
    id: '3',
    title: 'ריהוט',
    subtitle: 'ריהוט לבית ולמשרד',
    image: designerFurnitureImage,
    size: 'medium' as const
  },
  {
    id: '4',
    title: 'שיפוצים',
    subtitle: 'קבלנים ושיפוצים',
    image: renovationImage,
    size: 'medium' as const
  }
];

const PublicHomepage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isGuestMode, 
    showLoginModal, 
    setShowLoginModal, 
    attemptedAction 
  } = useGuestMode();

  // Fetch featured suppliers from CMS for guest homepage
  const { data: homepageContent = [] } = useHomepagePublicContent('web');
  const featuredSupplierIds = homepageContent
    .filter(
      (item) =>
        item.section_type === 'supplier_cards' &&
        item.item_link_type === 'supplier' &&
        item.item_link_target_id
    )
    .map((item) => item.item_link_target_id!);
  const { data: featuredSuppliers = [], isLoading: isFeaturedLoading } =
    useFeaturedSuppliers(featuredSupplierIds);

  const handleCategoryClick = (category: typeof sampleCategories[0]) => {
    console.log('Category clicked:', category.title);
    
    // Map category title to route
    const categoryRoutes: Record<string, string> = {
      'מטבחים': '/category/kitchens/suppliers',
      'חדרי רחצה': '/category/bathroom/suppliers',
      'ריהוט': '/category/furniture/suppliers',
      'שיפוצים': '/category/renovation/suppliers'
    };
    
    const route = categoryRoutes[category.title];
    if (route) {
      navigate(route);
    }
  };

  const handleSupplierClick = (supplier: Supplier) => {
    console.log('Supplier clicked:', supplier.name);
    if (supplier.slug) {
      navigate(`/s/${supplier.slug}`);
    } else {
      navigate(`/supplier/${supplier.id}`);
    }
  };

  const handleCTAClick = () => {
    if (isGuestMode) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-[100svh] bg-background">
      {/* Guest mode indicator banner */}
      {isGuestMode && <GuestModeIndicator />}
      
      {/* Hero section */}
      <HeroSection href="/welcome" onCTAClick={handleCTAClick} />
      
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 space-y-12">
        {/* Categories */}
        <section>
          <SectionTitle title="קטגוריות פופולריות" />
          <CategorySection 
            items={sampleCategories}
            onItemClick={handleCategoryClick}
          />
        </section>

        {/* Top Suppliers */}
        <section>
          <SectionTitle title="ספקים מובילים" />
          <SupplierSection 
            suppliers={featuredSuppliers}
            onSupplierClick={handleSupplierClick}
          />
        </section>
      </div>

      {/* Bottom CTA */}
      <BottomCTA 
        title={isGuestMode ? "מוכן להתחיל?" : "חפש ספקים נוספים"}
        buttonText={isGuestMode ? "התחבר עכשיו" : "גלה עוד"}
        href="/welcome"
        onButtonClick={handleCTAClick}
      />

      {/* Login Modal for Guest Actions */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        attemptedAction={attemptedAction}
      />
    </div>
  );
};

export default PublicHomepage;