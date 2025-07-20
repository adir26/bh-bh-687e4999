
import React from 'react';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { TopBanner } from '@/components/TopBanner';
import { CategoryTagBar } from '@/components/CategoryTagBar';
import { CategorySection } from '@/components/CategorySection';
import { SupplierCard } from '@/components/SupplierCard';
import { ProjectCard } from '@/components/ProjectCard';
import { BottomCTA } from '@/components/BottomCTA';

const HotNow = () => {
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
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'מכשירי בית חכמים',
      subtitle: 'המלצות חכמות עבורך',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'גופי תאורה מעוצבים',
      subtitle: 'המלצות חכמות עבורך',
      image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=480&h=480&fit=crop'
    }
  ];

  // Top picks in area data
  const topPicksInArea = [
    {
      name: 'שיפוץ דירה כפר סבא',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop',
      description: 'שיפוץ מקיף של דירת 4 חדרים',
      location: 'כפר סבא',
      price: '₪150,000'
    },
    {
      name: 'מטבח חדש תל אביב',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop',
      description: 'מטבח מעוצב בסגנון מודרני',
      location: 'תל אביב',
      price: '₪80,000'
    },
    {
      name: 'חדר רחצה יוקרתי',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=480&h=480&fit=crop',
      description: 'חדר רחצה עם חומרים איכותיים',
      location: 'רמת גן',
      price: '₪45,000'
    }
  ];

  // High priority suppliers data
  const highPrioritySuppliers = [
    {
      logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop',
      name: 'קבלן שיפוצים מוביל',
      tagline: 'מומחים בשיפוצי יוקרה'
    },
    {
      logo: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=100&h=100&fit=crop',
      name: 'מעצב מטבחים מוביל',
      tagline: 'מטבחים מותאמים אישית'
    },
    {
      logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
      name: 'רהיטים מעוצבים',
      tagline: 'ריהוט איכותי ומעוצב'
    },
    {
      logo: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=100&h=100&fit=crop',
      name: 'מערכות מיזוג',
      tagline: 'פתרונות מיזוג מתקדמים'
    }
  ];

  // Trending this week data
  const trendingThisWeek = [
    {
      name: 'פרויקט שיפוץ פנטהאוס',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=480&fit=crop',
      description: 'פרויקט שיפוץ יוקרתי במרכז תל אביב'
    },
    {
      name: 'מטבח בסגנון כפרי',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=480&fit=crop',
      description: 'מטבח בסגנון כפרי מודרני'
    },
    {
      name: 'גינה על הגג',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=480&h=480&fit=crop',
      description: 'פרויקט גינה על גג הבניין'
    }
  ];

  // Trending for you data
  const trendingForYou = [
    {
      name: 'שיפוץ חדר שינה',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=480&h=480&fit=crop',
      description: 'רעיונות עיצוב לחדר שינה מושלם'
    },
    {
      name: 'פרקט למינציה איכותי',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=480&h=480&fit=crop',
      description: 'פרקט במגוון צבעים וטקסטורות'
    },
    {
      name: 'אביזרי אמבטיה מעוצבים',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=480&h=480&fit=crop',
      description: 'אביזרי אמבטיה בעיצוב מודרני'
    }
  ];

  // Event handlers
  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
  };

  const handleCategoryClick = (item: any) => {
    console.log('Category item clicked:', item);
  };

  const handleSupplierClick = (supplier: any) => {
    console.log('Supplier clicked:', supplier);
  };

  const handleProjectClick = (project: any) => {
    console.log('Project clicked:', project);
  };

  const handleCTAClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-20">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          {/* Top Banner */}
          <TopBanner 
            title="הפרויקטים המובילים באפליקציה"
            subtitle="גלו את הפרויקטים הכי חמים באפליקציה"
            backgroundImage="/lovable-uploads/02f7db9b-c10f-4507-8aaa-26782c277e6d.png"
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
