import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { CategorySection } from '@/components/CategorySection';

const TopSuppliers = () => {
  const navigate = useNavigate();

  // קבלני שיפוצים
  const renovationContractors = [
    {
      id: '1',
      title: 'קבלן שיפוצים מוביל 1',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'קבלן שיפוצים מוביל 2',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'קבלן שיפוצים מוביל 3',
      subtitle: 'קבלני שיפוצים',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    }
  ];

  // חשמלאים
  const electricians = [
    {
      id: '1',
      title: 'חשמלאי מוביל 1',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'חשמלאי מוביל 2',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חשמלאי מוביל 3',
      subtitle: 'חשמלאים',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    }
  ];

  // אינסטלטורים
  const plumbers = [
    {
      id: '1',
      title: 'אינסטלטור מוביל 1',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'אינסטלטור מוביל 2',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'אינסטלטור מוביל 3',
      subtitle: 'אינסטלטורים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    }
  ];

  // מתקיני מיזוג אוויר
  const airConditioningInstallers = [
    {
      id: '1',
      title: 'מתקין מיזוג מוביל 1',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מתקין מיזוג מוביל 2',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מתקין מיזוג מוביל 3',
      subtitle: 'מתקיני מיזוג אוויר',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    }
  ];

  // קבלני גבס
  const drywallContractors = [
    {
      id: '1',
      title: 'קבלן גבס מוביל 1',
      subtitle: 'קבלני גבס',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'קבלן גבס מוביל 2',
      subtitle: 'קבלני גבס',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'קבלן גבס מוביל 3',
      subtitle: 'קבלני גבס',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    }
  ];

  // מעצבי פנים
  const interiorDesigners = [
    {
      id: '1',
      title: 'מעצב פנים מוביל 1',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מעצב פנים מוביל 2',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מעצב פנים מוביל 3',
      subtitle: 'מעצבי פנים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    }
  ];

  // חנויות רהיטים
  const furnitureStores = [
    {
      id: '1',
      title: 'חנות רהיטים מובילה 1',
      subtitle: 'חנויות רהיטים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'חנות רהיטים מובילה 2',
      subtitle: 'חנויות רהיטים',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חנות רהיטים מובילה 3',
      subtitle: 'חנויות רהיטים',
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=480&h=480&fit=crop'
    }
  ];

  // יועצי משכנתאות
  const mortgageAdvisors = [
    {
      id: '1',
      title: 'יועץ משכנתאות מוביל 1',
      subtitle: 'יועצי משכנתאות',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'יועץ משכנתאות מוביל 2',
      subtitle: 'יועצי משכנתאות',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'יועץ משכנתאות מוביל 3',
      subtitle: 'יועצי משכנתאות',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=480&fit=crop'
    }
  ];

  // חברות הובלה
  const movingCompanies = [
    {
      id: '1',
      title: 'חברת הובלה מובילה 1',
      subtitle: 'חברות הובלה',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'חברת הובלה מובילה 2',
      subtitle: 'חברות הובלה',
      image: 'https://images.unsplash.com/photo-1609942924155-81c0ad76e738?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חברת הובלה מובילה 3',
      subtitle: 'חברות הובלה',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=480&fit=crop'
    }
  ];

  // Event handlers
  const handleCategoryClick = (item: any) => {
    console.log('Supplier clicked:', item);
  };

  const handleAllSuppliersClick = (category: string) => {
    navigate(`/category/${category}/suppliers`);
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-8">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          <div className="w-full">
            <SectionTitleWithButton 
              title="קבלני שיפוצים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('renovation-contractors')}
            />
            <CategorySection 
              items={renovationContractors} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חשמלאים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('electricians')}
            />
            <CategorySection 
              items={electricians} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="אינסטלטורים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('plumbers')}
            />
            <CategorySection 
              items={plumbers} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="מתקיני מיזוג אוויר" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('air-conditioning')}
            />
            <CategorySection 
              items={airConditioningInstallers} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="קבלני גבס" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('drywall-contractors')}
            />
            <CategorySection 
              items={drywallContractors} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="מעצבי פנים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('interior-designers')}
            />
            <CategorySection 
              items={interiorDesigners} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חנויות רהיטים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('furniture')}
            />
            <CategorySection 
              items={furnitureStores} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="יועצי משכנתאות" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('mortgage-advisors')}
            />
            <CategorySection 
              items={mortgageAdvisors} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חברות הובלה" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('moving-companies')}
            />
            <CategorySection 
              items={movingCompanies} 
              onItemClick={handleCategoryClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopSuppliers;
