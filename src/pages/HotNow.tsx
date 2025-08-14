
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { TopBanner } from '@/components/TopBanner';
import { CategoryTagBar } from '@/components/CategoryTagBar';
import { CategorySection } from '@/components/CategorySection';
import { SupplierCard } from '@/components/SupplierCard';
import { ProjectCard } from '@/components/ProjectCard';
import { BottomCTA } from '@/components/BottomCTA';
import { showToast } from '@/utils/toast';

// Import luxury images
import hotNowHero from '@/assets/hot-now-hero.jpg';
import luxuryFurnitureSmart from '@/assets/luxury-furniture-smart.jpg';
import smartAppliancesLuxury from '@/assets/smart-appliances-luxury.jpg';
import designerLightingLuxury from '@/assets/designer-lighting-luxury.jpg';
import luxuryRenovationKfarSaba from '@/assets/luxury-renovation-kfar-saba.jpg';
import luxuryKitchenTelAviv from '@/assets/luxury-kitchen-tel-aviv.jpg';
import luxuryBathroomRamatGan from '@/assets/luxury-bathroom-ramat-gan.jpg';
import luxuryContractorLogo from '@/assets/luxury-contractor-logo.jpg';
import kitchenDesignerLogo from '@/assets/kitchen-designer-logo.jpg';
import furnitureShowroomLogo from '@/assets/furniture-showroom-logo.jpg';
import hvacSystemsLogo from '@/assets/hvac-systems-logo.jpg';
import luxuryPenthouseProject from '@/assets/luxury-penthouse-project.jpg';
import luxuryRusticKitchen from '@/assets/luxury-rustic-kitchen.jpg';
import luxuryRooftopGarden from '@/assets/luxury-rooftop-garden.jpg';
import luxuryBedroomRenovation from '@/assets/luxury-bedroom-renovation.jpg';
import premiumLaminateFlooring from '@/assets/premium-laminate-flooring.jpg';
import luxuryBathroomAccessories from '@/assets/luxury-bathroom-accessories.jpg';

const HotNow = () => {
  const navigate = useNavigate();

  // Category tags data
  const categories = [
    { id: 'kitchens', name: 'מטבחים' },
    { id: 'interior', name: 'עיצוב פנים' },
    { id: 'renovation', name: 'שיפוצים' },
    { id: 'plumbing', name: 'אינסטלציה' },
    { id: 'electrical', name: 'חשמל' },
    { id: 'furniture', name: 'רהיטים' }
  ];

  // Smart recommendations data
  const smartRecommendations = [
    {
      id: '1',
      title: 'רהיטים איכותיים',
      subtitle: 'המלצות חכמות עבורך',
      image: luxuryFurnitureSmart
    },
    {
      id: '2',
      title: 'מכשירי בית חכמים',
      subtitle: 'המלצות חכמות עבורך',
      image: smartAppliancesLuxury
    },
    {
      id: '3',
      title: 'גופי תאורה מעוצבים',
      subtitle: 'המלצות חכמות עבורך',
      image: designerLightingLuxury
    }
  ];

  // Top picks in area data
  const topPicksInArea = [
    {
      name: 'שיפוץ דירה כפר סבא',
      image: luxuryRenovationKfarSaba,
      description: 'שיפוץ מקיף של דירת 4 חדרים',
      location: 'כפר סבא',
      price: '₪150,000'
    },
    {
      name: 'מטבח חדש תל אביב',
      image: luxuryKitchenTelAviv,
      description: 'מטבח מעוצב בסגנון מודרני',
      location: 'תל אביב',
      price: '₪80,000'
    },
    {
      name: 'חדר רחצה יוקרתי',
      image: luxuryBathroomRamatGan,
      description: 'חדר רחצה עם חומרים איכותיים',
      location: 'רמת גן',
      price: '₪45,000'
    }
  ];

  // High priority suppliers data
  const highPrioritySuppliers = [
    {
      logo: luxuryContractorLogo,
      name: 'קבלן שיפוצים מוביל',
      tagline: 'מומחים בשיפוצי יוקרה'
    },
    {
      logo: kitchenDesignerLogo,
      name: 'מעצב מטבחים מוביל',
      tagline: 'מטבחים מותאמים אישית'
    },
    {
      logo: furnitureShowroomLogo,
      name: 'רהיטים מעוצבים',
      tagline: 'ריהוט איכותי ומעוצב'
    },
    {
      logo: hvacSystemsLogo,
      name: 'מערכות מיזוג',
      tagline: 'פתרונות מיזוג מתקדמים'
    }
  ];

  // Trending this week data
  const trendingThisWeek = [
    {
      name: 'פרויקט שיפוץ פנטהאוס',
      image: luxuryPenthouseProject,
      description: 'פרויקט שיפוץ יוקרתי במרכז תל אביב'
    },
    {
      name: 'מטבח בסגנון כפרי',
      image: luxuryRusticKitchen,
      description: 'מטבח בסגנון כפרי מודרני'
    },
    {
      name: 'גינה על הגג',
      image: luxuryRooftopGarden,
      description: 'פרויקט גינה על גג הבניין'
    }
  ];

  // Trending for you data
  const trendingForYou = [
    {
      name: 'שיפוץ חדר שינה',
      image: luxuryBedroomRenovation,
      description: 'רעיונות עיצוב לחדר שינה מושלם'
    },
    {
      name: 'פרקט למינציה איכותי',
      image: premiumLaminateFlooring,
      description: 'פרקט במגוון צבעים וטקסטורות'
    },
    {
      name: 'אביזרי אמבטיה מעוצבים',
      image: luxuryBathroomAccessories,
      description: 'אביזרי אמבטיה בעיצוב מודרני'
    }
  ];

  // Event handlers
  const handleCategorySelect = (categoryId: string) => {
    showToast.info(`סונן לפי קטגוריה: ${categories.find(c => c.id === categoryId)?.name}`);
  };

  const handleCategoryClick = (item: any) => {
    showToast.success(`נבחר פריט: ${item.title} - בקרוב יפתח עמוד מפורט`);
  };

  const handleSupplierClick = (supplier: any) => {
    showToast.success(`נבחר ספק: ${supplier.name} - יועבר לפרופיל`);
  };

  const handleProjectClick = (project: any) => {
    showToast.success(`נבחר פרויקט: ${project.name} - יועבר לפרטים`);
  };

  const handleCTAClick = () => {
    navigate('/onboarding/welcome');
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-nav-safe">
        <div className="flex flex-col items-start w-full">
          {/* Back Arrow Button */}
          <div className="w-full px-4 pt-4 pb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border hover:bg-gray-50 transition-colors"
              aria-label="חזרה"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <Header userName="איתן" />
          
          {/* Top Banner */}
          <TopBanner 
            title="הפרויקטים המובילים באפליקציה"
            subtitle="גלו את הפרויקטים הכי חמים באפליקציה"
            backgroundImage={hotNowHero}
          />
          
          {/* Category Tag Navigation */}
          <CategoryTagBar 
            categories={categories}
            onCategorySelect={handleCategorySelect}
          />
          
          {/* Smart Recommendations */}
          <div className="w-full">
            <SectionTitle title="המלצות חכמות בדיוק עבורך" />
            <CategorySection 
              items={smartRecommendations} 
              onItemClick={handleCategoryClick}
            />
          </div>

          {/* Top Picks in Your Area */}
          <div className="w-full">
            <SectionTitle title="הטופ פיקס באזור שלך" />
            <div className="flex items-start w-full mb-4">
              <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full">
                {topPicksInArea.map((project) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    image={project.image}
                    description={project.description}
                    location={project.location}
                    price={project.price}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* High Priority Suppliers */}
          <div className="w-full">
            <SectionTitle title="ספקים בעדיפות גבוהה" />
            <div className="flex items-start w-full mb-4">
              <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full">
                {highPrioritySuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.name}
                    logo={supplier.logo}
                    name={supplier.name}
                    tagline={supplier.tagline}
                    onClick={() => handleSupplierClick(supplier)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trending This Week */}
          <div className="w-full">
            <SectionTitle title="טרנדי השבוע" />
            <div className="flex items-start w-full mb-4">
              <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full">
                {trendingThisWeek.map((project) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    image={project.image}
                    description={project.description}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trending For You */}
          <div className="w-full">
            <SectionTitle title="טרנדי עבורך" />
            <div className="flex items-start w-full mb-4">
              <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full">
                {trendingForYou.map((project) => (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    image={project.image}
                    description={project.description}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <BottomCTA 
            title="אל תפספסו את ההזדמנויות הכי חמות"
            buttonText="התחילו לחקור"
            onButtonClick={handleCTAClick}
          />
        </div>
      </main>
    </div>
  );
};

export default HotNow;
