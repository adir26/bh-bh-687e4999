import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '@/components/modals/LoginModal';
import { GuestModeIndicator } from '@/components/GuestModeIndicator';
import { useGuestMode } from '@/hooks/useGuestMode';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AdBanner } from '@/components/AdBanner';
import { SectionTitle } from '@/components/SectionTitle';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { QuickSelection } from '@/components/QuickSelection';
import { CategorySection } from '@/components/CategorySection';
import { SupplierSection } from '@/components/SupplierSection';
import { BottomCTA } from '@/components/BottomCTA';
import { getSuppliersByCategory } from '@/data/suppliers';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

// Import local images
import kitchenDesignImg from '@/assets/kitchen-design.jpg';
import kitchenAccessoriesImg from '@/assets/kitchen-accessories.jpg';
import kitchenModernImg from '@/assets/kitchen-modern.jpg';
import kitchenHardwareImg from '@/assets/kitchen-hardware.jpg';
import kitchenInstallationImg from '@/assets/kitchen-installation.jpg';
import furnitureImg from '@/assets/furniture.jpg';
import airConditioningImg from '@/assets/air-conditioning.jpg';
import renovationImg from '@/assets/renovation.jpg';

const PublicHomepage = () => {
  const navigate = useNavigate();
  const { isGuestMode, isAppMode } = useGuestMode();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Quick selection data
  const quickSelectionItems = [
    {
      id: '1',
      title: 'מטבחים',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/412b6930986355e60bd9ab81c33874aa5793c909?width=256'
    },
    {
      id: '2',
      title: 'ריהוט',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/79cf482cde57d1401ddfb44ac7f4407b97b7a749?width=256'
    },
    {
      id: '3',
      title: 'מיזוג אוויר',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/0e229886b939e7efe2eaf0ec52f96dd014bce76a?width=256'
    },
    {
      id: '4',
      title: 'שיפוצים',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=256'
    }
  ];

  // Kitchen categories data
  const kitchenCategories = [
    {
      id: '1',
      title: 'מטבחים מעוצבים',
      subtitle: 'מטבחים',
      image: kitchenModernImg
    },
    {
      id: '2',
      title: 'אבזור למטבח',
      subtitle: 'מטבחים',
      image: kitchenHardwareImg
    },
    {
      id: '3',
      title: 'התקנת מטבחים',
      subtitle: 'מטבחים',
      image: kitchenInstallationImg
    },
    {
      id: '4',
      title: 'עיצוב מטבחים',
      subtitle: 'מטבחים',
      image: kitchenDesignImg
    },
    {
      id: '5',
      title: 'אביזרי מטבח',
      subtitle: 'מטבחים',
      image: kitchenAccessoriesImg
    }
  ];

  // Furniture data
  const furnitureItems = [
    {
      id: '1',
      title: 'ריהוט מודרני',
      subtitle: 'ריהוט',
      image: furnitureImg
    },
    {
      id: '2',
      title: 'חנות רהיטים',
      subtitle: 'ריהוט',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'עיצוב רהיטים',
      subtitle: 'ריהוט',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=480&fit=crop'
    }
  ];

  // Air conditioning data
  const airConditioningItems = [
    {
      id: '1',
      title: 'מיזוג אוויר',
      subtitle: 'מיזוג',
      image: airConditioningImg
    },
    {
      id: '2',
      title: 'מערכות קירור',
      subtitle: 'מיזוג',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'שירותי מיזוג',
      subtitle: 'מיזוג',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    }
  ];

  // Renovation data
  const renovationItems = [
    {
      id: '1',
      title: 'שיפוצי בתים',
      subtitle: 'שיפוצים',
      image: renovationImg
    },
    {
      id: '2',
      title: 'שיפוצים פנימיים',
      subtitle: 'שיפוצים',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'עיצוב שיפוצים',
      subtitle: 'שיפוצים',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    }
  ];

  // Get suppliers for each category
  const kitchenSuppliers = getSuppliersByCategory('kitchens');
  const furnitureSuppliers = getSuppliersByCategory('furniture');
  const airConditioningSuppliers = getSuppliersByCategory('air-conditioning');
  const renovationSuppliers = getSuppliersByCategory('renovation');

  // Event handlers - account actions trigger login modal
  const requireAuth = (action: () => void, actionName?: string) => {
    if (isGuestMode) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleQuickSelectionClick = (item: any) => {
    console.log('Quick selection clicked:', item);
    if (item.id === '1') { // מטבחים
      navigate('/category/kitchens/suppliers');
    } else if (item.id === '2') { // ריהוט
      navigate('/category/furniture/suppliers');
    } else if (item.id === '3') { // מיזוג אוויר
      navigate('/category/air-conditioning/suppliers');
    } else if (item.id === '4') { // שיפוצים
      navigate('/category/renovation/suppliers');
    }
  };

  const handleCategoryClick = (item: any) => {
    showToast.comingSoon(`קטגוריה: ${item.title}`);
  };

  const handleSupplierClick = (supplier: any) => {
    navigate(`/supplier/${supplier.id}`);
  };

  const handleAllSuppliersClick = (category: string) => {
    navigate(`/category/${category}/suppliers`);
  };

  const handleHeroCTA = () => {
    requireAuth(() => navigate('/onboarding/welcome'));
  };

  const handleAdClick = () => {
    showToast.comingSoon('פרטי המבצע');
  };

  const handleBottomCTA = () => {
    requireAuth(() => navigate('/onboarding/welcome'));
  };

  // Guest mode header component
  const GuestHeader = () => (
    <div className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-sm">B</span>
        </div>
        <span className="font-semibold text-lg">בונים פה</span>
      </div>
      
      {!isAppMode && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            התחבר
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            הירשם
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-background">
      <main className="flex flex-col items-start w-full bg-muted/30 pb-nav-safe">
        <div className="flex flex-col items-start w-full">
          {isGuestMode ? (
            <>
              <GuestHeader />
              <GuestModeIndicator onLoginClick={() => setShowLoginModal(true)} />
            </>
          ) : (
            <Header userName="אורח" />
          )}
          
          {/* Hero Section */}
          <HeroSection onCTAClick={handleHeroCTA} />
        
          <div className="w-full">
            <SectionTitle title="בחירה מהירה" />
            <QuickSelection 
              items={quickSelectionItems} 
              onItemClick={handleQuickSelectionClick}
            />
          </div>

          <div className="w-full">
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

          <div className="w-full">
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
              onItemClick={(item) => handleSupplierClick(furnitureSuppliers.find(s => s.id === item.id))}
            />
          </div>

          {/* Ad Banner */}
          <AdBanner onAdClick={handleAdClick} />

          <div className="w-full">
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
              onItemClick={(item) => handleSupplierClick(airConditioningSuppliers.find(s => s.id === item.id))}
            />
          </div>

          <div className="w-full">
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
              onItemClick={(item) => handleSupplierClick(renovationSuppliers.find(s => s.id === item.id))}
            />
          </div>

          {/* Bottom CTA */}
          <BottomCTA 
            title="מוכנים לבנות את הבית שלכם?"
            buttonText="התחילו עכשיו"
            onButtonClick={handleBottomCTA}
          />
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="התחברות נדרשת"
        description="היכנס כדי לקבל גישה מלאה לכל התכונות והשירותים"
      />
    </div>
  );
};

export default PublicHomepage;