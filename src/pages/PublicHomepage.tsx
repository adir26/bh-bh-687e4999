import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { CategorySection } from '@/components/CategorySection';
import { SectionTitle } from '@/components/SectionTitle';
import { SupplierSection } from '@/components/SupplierSection';
import { BottomCTA } from '@/components/BottomCTA';
import { SiteFooter } from '@/components/SiteFooter';
import { GuestModeIndicator } from '@/components/GuestModeIndicator';
import { LoginModal } from '@/components/modals/LoginModal';
import { useGuestMode } from '@/hooks/useGuestMode';
import { suppliers } from '@/data/suppliers';

// Sample categories for guest mode
const sampleCategories = [
  {
    id: '1',
    title: 'מטבחים',
    subtitle: 'עיצוב וייצור מטבחים',
    image: '/src/assets/kitchen-design.jpg',
    size: 'medium' as const
  },
  {
    id: '2',
    title: 'חדרי רחצה',
    subtitle: 'אביזרים ועיצוב',
    image: '/src/assets/luxury-bathroom-accessories.jpg',
    size: 'medium' as const
  },
  {
    id: '3',
    title: 'ריהוט',
    subtitle: 'ריהוט לבית ולמשרד',
    image: '/src/assets/furniture.jpg',
    size: 'medium' as const
  },
  {
    id: '4',
    title: 'שיפוצים',
    subtitle: 'קבלנים ושיפוצים',
    image: '/src/assets/renovation.jpg',
    size: 'medium' as const
  }
];

const PublicHomepage: React.FC = () => {
  const { 
    isGuestMode, 
    showLoginModal, 
    setShowLoginModal, 
    attemptedAction 
  } = useGuestMode();

  const handleCategoryClick = (category: typeof sampleCategories[0]) => {
    console.log('Category clicked:', category.title);
  };

  const handleSupplierClick = (supplier: any) => {
    console.log('Supplier clicked:', supplier.name);
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
      <HeroSection />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
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
            suppliers={suppliers.slice(0, 6)} // Show first 6 suppliers
            onSupplierClick={handleSupplierClick}
          />
        </section>
      </div>

      {/* Bottom CTA */}
      <BottomCTA 
        title={isGuestMode ? "מוכן להתחיל?" : "חפש ספקים נוספים"}
        buttonText={isGuestMode ? "התחבר עכשיו" : "גלה עוד"}
        onButtonClick={handleCTAClick}
      />
      
      {/* Footer */}
      <SiteFooter />

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