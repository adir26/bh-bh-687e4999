
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { CategorySection } from '@/components/CategorySection';
import { BottomCTA } from '@/components/BottomCTA';
import { showToast } from '@/utils/toast';

const LocalDeals = () => {
  const navigate = useNavigate();

  // Local deals data
  const localDeals = [
    {
      id: '1',
      title: 'שיפוץ מטבח - הנחה 20%',
      subtitle: 'מבצע מקומי - תל אביב',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מיזוג אוויר - מחיר מיוחד',
      subtitle: 'מבצע מקומי - רמת גן',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'רהיטים למשפחות חדשות',
      subtitle: 'מבצע מקומי - כפר סבא',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    }
  ];

  const exclusiveOffers = [
    {
      id: '1',
      title: 'פקט שיפוץ בבית',
      subtitle: 'חבילה מיוחדת לבתי פרטיים',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'עיצוב חדר הילדים',
      subtitle: 'הצעה מיוחדת למשפחות',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'שיפוץ חדר רחצה מהיר',
      subtitle: 'תוך שבוע אחד בלבד',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=480&h=480&fit=crop'
    }
  ];

  const limitedTimeOffers = [
    {
      id: '1',
      title: 'הובלה חינם השבוע',
      subtitle: 'מוגבל לשבוע הזה בלבד',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'ייעוץ משכנתא חינם',
      subtitle: 'הצעה ליום השלשה בלבד',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'בדיקת מיזוג חינם',
      subtitle: 'השבוע בלבד - לא תחמיצו',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    }
  ];

  const communityDeals = [
    {
      id: '1',
      title: 'מבצע שכונתי - גדרה',
      subtitle: 'הנחות לתושבי השכונה',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מבצע קהילתי - רעננה',
      subtitle: 'שיפוצים לקהילה',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'הנחה לוועד בית - הרצליה',
      subtitle: 'הצעה מיוחדת לוועדי בתים',
      image: 'https://images.unsplash.com/photo-1607083206325-cad9886eacb8?w=480&h=480&fit=crop'
    }
  ];

  // Event handlers
  const handleDealClick = (deal: any) => {
    showToast.success(`נבחר מבצע: ${deal.title} - צור קשר עם הספק`);
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
          
          <div className="w-full">
            <SectionTitle title="מבצעים מקומיים באזור שלך" />
            <CategorySection 
              items={localDeals} 
              onItemClick={handleDealClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="הצעות בלעדיות" />
            <CategorySection 
              items={exclusiveOffers} 
              onItemClick={handleDealClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="מבצעים לזמן מוגבל" />
            <CategorySection 
              items={limitedTimeOffers} 
              onItemClick={handleDealClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="מבצעי קהילה" />
            <CategorySection 
              items={communityDeals} 
              onItemClick={handleDealClick}
            />
          </div>

          {/* Bottom CTA */}
          <BottomCTA 
            title="אל תפספסו את המבצעים הכי טובים"
            buttonText="צרו קשר עכשיו"
            onButtonClick={handleCTAClick}
          />
        </div>
      </main>
    </div>
  );
};

export default LocalDeals;
