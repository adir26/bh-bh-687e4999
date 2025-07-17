import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { QuickSelection } from '@/components/QuickSelection';
import { CategorySection } from '@/components/CategorySection';

const Index = () => {
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
      title: 'המומלצים שלכם',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=256'
    },
    {
      id: '5',
      title: 'המובילים בspike',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=256'
    }
  ];

  // Kitchen categories data
  const kitchenCategories = [
    {
      id: '1',
      title: 'מטבחים מעוצבים',
      subtitle: 'Kitchens',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/deaa39cc14e28e578f44dca1d0765d394726daf1?width=480'
    },
    {
      id: '2',
      title: 'אבזור למטבח',
      subtitle: 'Kitchens',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/6a71d73e6d5706c34f7cef02e61a2717c7a74c77?width=480'
    },
    {
      id: '3',
      title: 'Kitchen Design',
      subtitle: 'Kitchens',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Exclusive deals data
  const exclusiveDeals = [
    {
      id: '1',
      title: 'Exclusive Deals',
      subtitle: 'Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Special Offers',
      subtitle: 'Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Limited Time Discount',
      subtitle: 'Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Furniture data
  const furnitureItems = [
    {
      id: '1',
      title: 'Modern Furniture',
      subtitle: 'Furniture',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Furniture Store',
      subtitle: 'Furniture',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Furniture Design',
      subtitle: 'Furniture',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Air conditioning data
  const airConditioningItems = [
    {
      id: '1',
      title: 'Air Conditioning',
      subtitle: 'Air Conditioning',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Cooling System',
      subtitle: 'Air Conditioning',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'HVAC Services',
      subtitle: 'Air Conditioning',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Renovation data
  const renovationItems = [
    {
      id: '1',
      title: 'Home Renovation',
      subtitle: 'Renovation',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Interior Renovation',
      subtitle: 'Renovation',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Renovation Design',
      subtitle: 'Renovation',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Mortgage advisors data
  const mortgageAdvisors = [
    {
      id: '1',
      title: 'Mortgage Advisor',
      subtitle: 'Mortgage Advisors',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Financial Advisor',
      subtitle: 'Mortgage Advisors',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Loan Advisor',
      subtitle: 'Mortgage Advisors',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Moving services data
  const movingServices = [
    {
      id: '1',
      title: 'Moving Services',
      subtitle: 'Moving Services',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Relocation Services',
      subtitle: 'Moving Services',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Packing Services',
      subtitle: 'Moving Services',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Home loans data
  const homeLoans = [
    {
      id: '1',
      title: 'Home Loans',
      subtitle: 'Home Loans',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Mortgage Loans',
      subtitle: 'Home Loans',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Property Loans',
      subtitle: 'Home Loans',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Local deals data
  const localDeals = [
    {
      id: '1',
      title: 'Local Deals',
      subtitle: 'Local Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Nearby Offers',
      subtitle: 'Local Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Community Deals',
      subtitle: 'Local Deals',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Trending items data
  const trendingItems = [
    {
      id: '1',
      title: 'Trending Products',
      subtitle: 'Trending Now',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '2',
      title: 'Popular Items',
      subtitle: 'Trending Now',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    },
    {
      id: '3',
      title: 'Hot Deals',
      subtitle: 'Trending Now',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=480'
    }
  ];

  // Event handlers
  const handleQuickSelectionClick = (item: any) => {
    console.log('Quick selection clicked:', item);
  };

  const handleCategoryClick = (item: any) => {
    console.log('Category clicked:', item);
  };

  return (
    <div className="flex w-[428px] h-[959px] flex-col items-start bg-white max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:max-w-full">
      <main className="flex h-[844px] min-h-[844px] flex-col items-start shrink-0 self-stretch bg-neutral-50">
        <div className="flex flex-col items-start self-stretch">
          <Header userName="איתן" />
          
          <SectionTitle title="בחירה מהירה" />
          <QuickSelection 
            items={quickSelectionItems} 
            onItemClick={handleQuickSelectionClick}
          />

          <SectionTitle title="מטבחים" />
          <CategorySection 
            items={kitchenCategories} 
            onItemClick={handleCategoryClick}
            fixedWidth={true}
          />

          <SectionTitle title="בלעדי לבונים-פה" />
          <CategorySection 
            items={exclusiveDeals} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="ריהוט" />
          <CategorySection 
            items={furnitureItems} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="מיזוג אוויר" />
          <CategorySection 
            items={airConditioningItems} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="שיפוצים" />
          <CategorySection 
            items={renovationItems} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="יועצי משכנתאות וביטוח" />
          <CategorySection 
            items={mortgageAdvisors} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="הובלות" />
          <CategorySection 
            items={movingServices} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="הלוואות" />
          <CategorySection 
            items={homeLoans} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="מבצעים בסביבה" />
          <CategorySection 
            items={localDeals} 
            onItemClick={handleCategoryClick}
          />

          <SectionTitle title="פופולרי עכשיו" />
          <CategorySection 
            items={trendingItems} 
            onItemClick={handleCategoryClick}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
