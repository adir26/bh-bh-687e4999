
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { CategorySection } from '@/components/CategorySection';
import { SupplierCard } from '@/components/SupplierCard';
import { BottomCTA } from '@/components/BottomCTA';

const PopularNow = () => {
  const navigate = useNavigate();

  // Most popular suppliers data
  const mostPopularSuppliers = [
    {
      logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop',
      name: 'מטבחי פרימיום',
      tagline: 'הכי פופולרי השנה'
    },
    {
      logo: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=100&h=100&fit=crop',
      name: 'עיצוב מודרני',
      tagline: 'הבחירה של הלקוחות'
    },
    {
      logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
      name: 'רהיטי יוקרה',
      tagline: 'המובילים בתחום'
    },
    {
      logo: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=100&h=100&fit=crop',
      name: 'מיזוג מתקדם',
      tagline: 'הפתרון המבוקש'
    }
  ];

  // Trending categories data
  const trendingCategories = [
    {
      id: '1',
      title: 'מטבחים חכמים',
      subtitle: 'הטרנד הכי חם',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'בתים ירוקים',
      subtitle: 'הפופולרי ביותר',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חדרי עבודה ביתיים',
      subtitle: 'הדרישה הגדולה השנה',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=480&h=480&fit=crop'
    }
  ];

  // Most searched services data
  const mostSearchedServices = [
    {
      id: '1',
      title: 'שיפוץ מקיף',
      subtitle: 'השירות הכי מבוקש',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'עיצוב פנים מלא',
      subtitle: 'חיפושים רבים החודש',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'התקנת מיזוג חדש',
      subtitle: 'הכי פופולרי בעונה',
      image: 'https://images.unsplash.com/photo-1634638324170-0cd3b310f2ae?w=480&h=480&fit=crop'
    }
  ];

  // Customer favorites data
  const customerFavorites = [
    {
      id: '1',
      title: 'חברת השיפוצים הנבחרת',
      subtitle: 'המועדפת על הלקוחות',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מעצב הפנים המוביל',
      subtitle: 'הדירוגים הגבוהים ביותר',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'חנות הרהיטים הפופולרית',
      subtitle: 'בחירת הלקוחות מספר 1',
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=480&h=480&fit=crop'
    }
  ];

  // Event handlers
  const handleSupplierClick = (supplier: any) => {
    console.log('Popular supplier clicked:', supplier);
  };

  const handleCategoryClick = (item: any) => {
    console.log('Popular category clicked:', item);
  };

  const handleCTAClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-20">
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
          
          {/* Most Popular Suppliers */}
          <div className="w-full">
            <SectionTitle title="הספקים הפופולרים ביותר" />
            <div className="flex items-start w-full mb-4">
              <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full">
                {mostPopularSuppliers.map((supplier) => (
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

          <div className="w-full">
            <SectionTitle title="קטגוריות בטרנד" />
            <CategorySection 
              items={trendingCategories} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="השירותים הכי מחופשים" />
            <CategorySection 
              items={mostSearchedServices} 
              onItemClick={handleCategoryClick}
            />
          </div>

          <div className="w-full">
            <SectionTitle title="המועדפים על הלקוחות" />
            <CategorySection 
              items={customerFavorites} 
              onItemClick={handleCategoryClick}
            />
          </div>

          {/* Bottom CTA */}
          <BottomCTA 
            title="הצטרפו לאלפי לקוחות מרוצים"
            buttonText="בואו נתחיל"
            onButtonClick={handleCTAClick}
          />
        </div>
      </main>
    </div>
  );
};

export default PopularNow;
