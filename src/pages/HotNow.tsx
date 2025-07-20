
import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { CategorySection } from '@/components/CategorySection';

const HotNow = () => {
  // Trending products data
  const trendingProducts = [
    {
      id: '1',
      title: 'מטבחים מעוצבים',
      subtitle: 'מוצרים חמים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'ריהוט מודרני',
      subtitle: 'מוצרים חמים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מערכות מיזוג',
      subtitle: 'מוצרים חמים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    }
  ];

  // Popular categories data
  const popularCategories = [
    {
      id: '1',
      title: 'שיפוצי בתים',
      subtitle: 'קטגוריות פופולריות',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'עיצוב פנים',
      subtitle: 'קטגוריות פופולריות',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'יועצי משכנתאות',
      subtitle: 'קטגוריות פופולריות',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop'
    }
  ];

  // Hot suppliers data
  const hotSuppliers = [
    {
      id: '1',
      title: 'קבלן שיפוצים מוביל',
      subtitle: 'ספקים חמים',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מעצב מטבחים מוביל',
      subtitle: 'ספקים חמים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חנות רהיטים מובילה',
      subtitle: 'ספקים חמים',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    }
  ];

  // Hot deals in your area
  const hotDealsInArea = [
    {
      id: '1',
      title: 'מבצע שיפוצים בתל אביב',
      subtitle: 'חם באזור שלך',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'הנחות מיזוג בירושלים',
      subtitle: 'חם באזור שלך',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'מבצע מטבחים בחיפה',
      subtitle: 'חם באזור שלך',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    }
  ];

  // Most searched this week
  const mostSearched = [
    {
      id: '1',
      title: 'קבלני גבס',
      subtitle: 'החיפושים הפופולריים',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'אינסטלטורים',
      subtitle: 'החיפושים הפופולריים',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חשמלאים',
      subtitle: 'החיפושים הפופולריים',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    }
  ];

  // Special offers
  const specialOffers = [
    {
      id: '1',
      title: 'הצעה מיוחדת לשיפוצים',
      subtitle: 'הצעות מיוחדות',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מבצע עד סוף החודש',
      subtitle: 'הצעות מיוחדות',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'הנחה לחברי קהילה',
      subtitle: 'הצעות מיוחדות',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=480&fit=crop'
    }
  ];

  // Event handlers
  const handleCategoryClick = (item: any) => {
    console.log('Hot item clicked:', item);
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-20">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          <div className="w-full">
            <SectionTitle title="מוצרים חמים ביותר" />
            <CategorySection 
              items={trendingProducts} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="קטגוריות פופולריות" />
            <CategorySection 
              items={popularCategories} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="ספקים חמים השבוע" />
            <CategorySection 
              items={hotSuppliers} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="חם באזור שלך" />
            <CategorySection 
              items={hotDealsInArea} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="החיפושים הפופולריים השבוע" />
            <CategorySection 
              items={mostSearched} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="הצעות מיוחדות" />
            <CategorySection 
              items={specialOffers} 
              onItemClick={handleCategoryClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotNow;
