import React from 'react';
import { Header } from '@/components/Header';
import { TopBanner } from '@/components/TopBanner';
import { CategorySection } from '@/components/CategorySection';
import { SectionTitle } from '@/components/SectionTitle';
import { BottomCTA } from '@/components/BottomCTA';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/utils/toast';

// Import premium images
import appExclusiveHero from '@/assets/app-exclusive-hero.jpg';
import exclusiveKitchenOffer from '@/assets/exclusive-kitchen-offer.jpg';
import exclusiveRenovation from '@/assets/exclusive-renovation.jpg';
import exclusiveMortgageAdvisor from '@/assets/exclusive-mortgage-advisor.jpg';
import premiumSupplierAccess from '@/assets/premium-supplier-access.jpg';
import realTimePricing from '@/assets/real-time-pricing.jpg';
import personalConsultation from '@/assets/personal-consultation.jpg';
import luxuryFurnitureDeal from '@/assets/luxury-furniture-deal.jpg';
import premiumAcInstallation from '@/assets/premium-ac-installation.jpg';
import premiumMovingServices from '@/assets/premium-moving-services.jpg';

const AppExclusive = () => {
  const navigate = useNavigate();

  // Exclusive app offers data
  const exclusiveOffers = [
    {
      id: '1',
      title: 'הנחה 20% למטבחים',
      subtitle: 'בלעדי לאפליקציה',
      image: exclusiveKitchenOffer
    },
    {
      id: '2',
      title: 'שיפוצים עם הנחה מיוחדת',
      subtitle: 'בלעדי לאפליקציה',
      image: exclusiveRenovation
    },
    {
      id: '3',
      title: 'יועץ משכנתאות בחינם',
      subtitle: 'בלעדי לאפליקציה',
      image: exclusiveMortgageAdvisor
    }
  ];

  const premiumBenefits = [
    {
      id: '1',
      title: 'גישה מיידית לספקים',
      subtitle: 'יתרונות פרימיום',
      image: premiumSupplierAccess
    },
    {
      id: '2',
      title: 'הערכות מחיר בזמן אמת',
      subtitle: 'יתרונות פרימיום',
      image: realTimePricing
    },
    {
      id: '3',
      title: 'ייעוץ אישי ללא עלות',
      subtitle: 'יתרונות פרימיום',
      image: personalConsultation
    }
  ];

  const specialDeals = [
    {
      id: '1',
      title: 'ריהוט בהנחה של 30%',
      subtitle: 'מבצעים בלעדיים',
      image: luxuryFurnitureDeal
    },
    {
      id: '2',
      title: 'מיזוג אוויר - התקנה חינם',
      subtitle: 'מבצעים בלעדיים',
      image: premiumAcInstallation
    },
    {
      id: '3',
      title: 'חבילת שירותי הובלה',
      subtitle: 'מבצעים בלעדיים',
      image: premiumMovingServices
    }
  ];

  const handleOfferClick = (offer: any) => {
    showToast.success(`נבחר מבצע: ${offer.title} - צור קשר עם ספק`);
  };

  const handleBottomCTA = () => {
    navigate('/onboarding/welcome');
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-background">
      <main className="flex flex-col items-start w-full bg-muted/30 pb-nav-safe">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          {/* Top Banner */}
          <TopBanner
            title="בלעדי לאפליקציה"
            subtitle="הטבות מיוחדות ומבצעים בלעדיים רק למשתמשי האפליקציה"
            backgroundImage={appExclusiveHero}
          />

          <div className="w-full">
            <SectionTitle title="מבצעים בלעדיים" />
            <CategorySection 
              items={exclusiveOffers} 
              onItemClick={handleOfferClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="יתרונות פרימיום" />
            <CategorySection 
              items={premiumBenefits} 
              onItemClick={handleOfferClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="הצעות מיוחדות" />
            <CategorySection 
              items={specialDeals} 
              onItemClick={handleOfferClick}
            />
          </div>

          {/* Bottom CTA */}
          <BottomCTA 
            title="הצטרף לקהילת הבונים והנה מההטבות הבלעדיות"
            buttonText="התחל עכשיו!"
            onButtonClick={handleBottomCTA}
          />
        </div>
      </main>
    </div>
  );
};

export default AppExclusive;