import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInGuestMode } from '@/hooks/useGuestMode';
import { OnboardingGuard } from '@/components/OnboardingGuard';
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
import { getSuppliersByCategory } from '@/data/suppliers';
import { showToast } from '@/utils/toast';

// Import local images
import kitchenDesignImg from '@/assets/kitchen-design.jpg';
import kitchenAccessoriesImg from '@/assets/kitchen-accessories.jpg';
import kitchenModernImg from '@/assets/kitchen-modern.jpg';
import kitchenHardwareImg from '@/assets/kitchen-hardware.jpg';
import kitchenInstallationImg from '@/assets/kitchen-installation.jpg';
import furnitureImg from '@/assets/furniture.jpg';
import airConditioningImg from '@/assets/air-conditioning.jpg';
import renovationImg from '@/assets/renovation.jpg';
import mortgageAdvisorImg from '@/assets/mortgage-advisor.jpg';
import movingServicesImg from '@/assets/moving-services.jpg';
import homeLoansImg from '@/assets/home-loans.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = isInGuestMode();
  
  // Calculate CTA href based on auth state
  const ctaHref = user && !isGuest ? '/onboarding/welcome' : '/welcome';
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

  // Exclusive deals data
  const exclusiveDeals = [
    {
      id: '1',
      title: 'מבצעים בלעדיים',
      subtitle: 'מבצעים',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'הצעות מיוחדות',
      subtitle: 'מבצעים',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'הנחות לזמן מוגבל',
      subtitle: 'מבצעים',
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=480&h=480&fit=crop'
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

  // Mortgage advisors data
  const mortgageAdvisors = [
    {
      id: '1',
      title: 'יועץ משכנתאות',
      subtitle: 'יועצים',
      image: mortgageAdvisorImg
    },
    {
      id: '2',
      title: 'יועץ פיננסי',
      subtitle: 'יועצים',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'יועץ הלוואות',
      subtitle: 'יועצים',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=480&h=480&fit=crop'
    }
  ];

  // Moving services data
  const movingServices = [
    {
      id: '1',
      title: 'שירותי הובלה',
      subtitle: 'הובלות',
      image: movingServicesImg
    },
    {
      id: '2',
      title: 'שירותי העברה',
      subtitle: 'הובלות',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'שירותי אריזה',
      subtitle: 'הובלות',
      image: 'https://images.unsplash.com/photo-1609942924155-81c0ad76e738?w=480&h=480&fit=crop'
    }
  ];

  // Home loans data
  const homeLoans = [
    {
      id: '1',
      title: 'הלוואות לדיור',
      subtitle: 'הלוואות',
      image: homeLoansImg
    },
    {
      id: '2',
      title: 'הלוואות משכנתא',
      subtitle: 'הלוואות',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'הלוואות נדל"ן',
      subtitle: 'הלוואות',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=480&h=480&fit=crop'
    }
  ];

  // Local deals data
  const localDeals = [
    {
      id: '1',
      title: 'מבצעים מקומיים',
      subtitle: 'מבצעים מקומיים',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'הצעות בקרבת מקום',
      subtitle: 'מבצעים מקומיים',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מבצעי קהילה',
      subtitle: 'מבצעים מקומיים',
      image: 'https://images.unsplash.com/photo-1607083206325-cad9886eacb8?w=480&h=480&fit=crop'
    }
  ];

  // Hot now items data - חם עכשיו
  const hotNowItems = [
    {
      id: '1',
      title: 'מוצרים חמים ביותר',
      subtitle: 'חם עכשיו',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'קטגוריות מחופשות',
      subtitle: 'חם עכשיו',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'ספקים פופולרים',
      subtitle: 'חם עכשיו',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=480&h=480&fit=crop'
    }
  ];

  // Trending items data
  const trendingItems = [
    {
      id: '1',
      title: 'חמים באזור שלך',
      subtitle: 'פופולרי עכשיו',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מבצעים מיוחדים',
      subtitle: 'פופולרי עכשיו',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'המבוקשים ביותר',
      subtitle: 'פופולרי עכשיו',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=480&h=480&fit=crop'
    }
  ];

  // Get suppliers for each category
  const kitchenSuppliers = getSuppliersByCategory('kitchens');
  const furnitureSuppliers = getSuppliersByCategory('furniture');
  const airConditioningSuppliers = getSuppliersByCategory('air-conditioning');
  const renovationSuppliers = getSuppliersByCategory('renovation');

  // Event handlers
  const handleQuickSelectionClick = (item: any) => {
    console.log('Quick selection clicked:', item);
    if (item.id === '1') { // מטבחים
      navigate('/category/kitchens/suppliers');
    } else if (item.id === '2') { // בלעדי לאפליקציה
      navigate('/app-exclusive');
    } else if (item.id === '3') { // ספקים חדשים
      navigate('/new-suppliers');
    } else if (item.id === '4') { // חם עכשיו
      navigate('/hot-now');
    } else if (item.id === '5') { // המובילים בבונים פה
      navigate('/top-suppliers');
    }
  };

  const handleCategoryClick = (item: any) => {
    // Map item subtitle to navigation routes
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
      'יועצים': '/support',
      'הובלות': '/support',
      'הלוואות': '/support',
      'מבצעים מקומיים': '/local-deals',
      'חם עכשיו': '/hot-now',
      'פופולרי עכשיו': '/popular-now'
    };
    
    const route = categoryRoutes[item.subtitle];
    if (route) {
      navigate(route);
    } else {
      // Fallback for items without a mapped route
      showToast.comingSoon(`קטגוריה: ${item.title}`);
    }
  };

  const handleSupplierClick = (supplier: any) => {
    navigate(`/supplier/${supplier.id}`);
  };

  const handleAllSuppliersClick = (category: string) => {
    navigate(`/category/${category}/suppliers`);
  };

  const handleLocalDealsClick = () => {
    navigate('/local-deals');
  };

  const handlePopularNowClick = () => {
    navigate('/popular-now');
  };

  const handleHeroCTA = () => {
    navigate('/onboarding/welcome');
  };

  const handleAdClick = () => {
    showToast.comingSoon('פרטי המבצע');
  };

  const handleBottomCTA = () => {
    navigate('/onboarding/welcome');
  };

  return (
    <OnboardingGuard role="client">
      <div className="flex w-full min-h-screen flex-col items-start bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-start w-full bg-muted/30 pb-nav-safe">
          <div className="flex flex-col items-start w-full">
            <Header userName="איתן" />
            
            {/* Onboarding Status Banner */}
            <OnboardingStatusBanner />
            
            {/* Hero Section */}
            <HeroSection href={ctaHref} onCTAClick={handleHeroCTA} showCTA={false} />
          
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
            <SectionTitle title="בלעדי לבונים-פה" />
            <CategorySection 
              items={exclusiveDeals} 
              onItemClick={handleCategoryClick}
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

          <div className="w-full">
            <SectionTitle title="יועצי משכנתאות וביטוח" />
            <CategorySection 
              items={mortgageAdvisors} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="הובלות" />
            <CategorySection 
              items={movingServices} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="הלוואות" />
            <CategorySection 
              items={homeLoans} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="מבצעים בסביבה" 
              buttonText="לכל המבצעים"
              onButtonClick={handleLocalDealsClick}
            />
            <CategorySection 
              items={localDeals} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חם עכשיו" 
              buttonText="לכל הפרויקטים"
              onButtonClick={() => navigate('/hot-now')}
            />
            <CategorySection 
              items={hotNowItems} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="פופולרי עכשיו" 
              buttonText="לכל הספקים"
              onButtonClick={handlePopularNowClick}
            />
            <CategorySection 
              items={trendingItems} 
              onItemClick={handleCategoryClick}
            />
          </div>
          
          {/* Bottom CTA */}
          <BottomCTA 
            title="מוכנים להתחיל את הפרויקט שלכם?"
            buttonText="בואו נתחיל"
            href={ctaHref}
            onButtonClick={handleBottomCTA}
            show={false}
          />
        </div>
      </main>
    </div>
    </OnboardingGuard>
  );
};

export default Index;
