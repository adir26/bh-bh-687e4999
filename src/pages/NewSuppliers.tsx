import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { CategorySection } from '@/components/CategorySection';

const NewSuppliers = () => {
  // קבלני שיפוצים חדשים
  const newRenovationContractors = [
    {
      id: '1',
      title: 'קבלן שיפוצים חדש 1',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'קבלן שיפוצים חדש 2',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'קבלן שיפוצים חדש 3',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    }
  ];

  // חשמלאים חדשים
  const newElectricians = [
    {
      id: '1',
      title: 'חשמלאי חדש 1',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'חשמלאי חדש 2',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חשמלאי חדש 3',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    }
  ];

  // אינסטלטורים חדשים
  const newPlumbers = [
    {
      id: '1',
      title: 'אינסטלטור חדש 1',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'אינסטלטור חדש 2',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'אינסטלטור חדש 3',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    }
  ];

  // מתקיני מיזוג אוויר חדשים
  const newAirConditioningInstallers = [
    {
      id: '1',
      title: 'מתקין מיזוג חדש 1',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מתקין מיזוג חדש 2',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מתקין מיזוג חדש 3',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    }
  ];

  // נגרים חדשים
  const newCarpenters = [
    {
      id: '1',
      title: 'נגר חדש 1',
      subtitle: 'נגרים ורהיטים בהזמנה אישית',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'נגר חדש 2',
      subtitle: 'נגרים ורהיטים בהזמנה אישית',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'נגר חדש 3',
      subtitle: 'נגרים ורהיטים בהזמנה אישית',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    }
  ];

  // מעצבי פנים חדשים
  const newInteriorDesigners = [
    {
      id: '1',
      title: 'מעצב פנים חדש 1',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מעצב פנים חדש 2',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מעצב פנים חדש 3',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    }
  ];

  // אדריכלים חדשים
  const newArchitects = [
    {
      id: '1',
      title: 'אדריכל חדש 1',
      subtitle: 'אדריכלים',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'אדריכל חדש 2',
      subtitle: 'אדריכלים',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'אדריכל חדש 3',
      subtitle: 'אדריכלים',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=480&fit=crop'
    }
  ];

  // מתכנני מטבחים חדשים
  const newKitchenDesigners = [
    {
      id: '1',
      title: 'מתכנן מטבחים חדש 1',
      subtitle: 'מתכנני מטבחים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מתכנן מטבחים חדש 2',
      subtitle: 'מתכנני מטבחים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מתכנן מטבחים חדש 3',
      subtitle: 'מתכנני מטבחים',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=480&h=480&fit=crop'
    }
  ];

  // חברות ניקיון חדשות
  const newCleaningCompanies = [
    {
      id: '1',
      title: 'חברת ניקיון חדשה 1',
      subtitle: 'חברות ניקיון',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'חברת ניקיון חדשה 2',
      subtitle: 'חברות ניקיון',
      image: 'https://images.unsplash.com/photo-1609942924155-81c0ad76e738?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חברת ניקיון חדשה 3',
      subtitle: 'חברות ניקיון',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=480&fit=crop'
    }
  ];

  // Event handlers
  const handleCategoryClick = (item: any) => {
    console.log('New supplier clicked:', item);
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-8">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          <div className="w-full">
            <SectionTitle title="קבלני שיפוצים חדשים" />
            <CategorySection 
              items={newRenovationContractors} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="חשמלאים חדשים" />
            <CategorySection 
              items={newElectricians} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="אינסטלטורים חדשים" />
            <CategorySection 
              items={newPlumbers} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="מתקיני מיזוג אוויר חדשים" />
            <CategorySection 
              items={newAirConditioningInstallers} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="נגרים חדשים" />
            <CategorySection 
              items={newCarpenters} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="מעצבי פנים חדשים" />
            <CategorySection 
              items={newInteriorDesigners} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="אדריכלים חדשים" />
            <CategorySection 
              items={newArchitects} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="מתכנני מטבחים חדשים" />
            <CategorySection 
              items={newKitchenDesigners} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="חברות ניקיון חדשות" />
            <CategorySection 
              items={newCleaningCompanies} 
              onItemClick={handleCategoryClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewSuppliers;
