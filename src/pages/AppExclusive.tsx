import React from 'react';
import { Header } from '@/components/Header';
import { TopBanner } from '@/components/TopBanner';
import { CategorySection } from '@/components/CategorySection';
import { SectionTitle } from '@/components/SectionTitle';
import { BottomCTA } from '@/components/BottomCTA';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/utils/toast';

const AppExclusive = () => {
  const navigate = useNavigate();

  // Exclusive app offers data
  const exclusiveOffers = [
    {
      id: '1',
      title: 'הנחה 20% למטבחים',
      subtitle: 'בלעדי לאפליקציה',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'שיפוצים עם הנחה מיוחדת',
      subtitle: 'בלעדי לאפליקציה',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'יועץ משכנתאות בחינם',
      subtitle: 'בלעדי לאפליקציה',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    }
  ];

  const premiumBenefits = [
    {
      id: '1',
      title: 'גישה מיידית לספקים',
      subtitle: 'יתרונות פרימיום',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'הערכות מחיר בזמן אמת',
      subtitle: 'יתרונות פרימיום',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'ייעוץ אישי ללא עלות',
      subtitle: 'יתרונות פרימיום',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=480&h=480&fit=crop'
    }
  ];

  const specialDeals = [
    {
      id: '1',
      title: 'ריהוט בהנחה של 30%',
      subtitle: 'מבצעים בלעדיים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מיזוג אוויר - התקנה חינם',
      subtitle: 'מבצעים בלעדיים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חבילת שירותי הובלה',
      subtitle: 'מבצעים בלעדיים',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
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
            backgroundImage="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop"
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