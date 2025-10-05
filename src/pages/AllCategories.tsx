import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChefHat, Droplets, Sofa, Snowflake, Hammer, Truck, Banknote, FileText, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';

const categoryIconMap: Record<string, LucideIcon> = {
  'kitchen': ChefHat,
  'bathroom': Droplets,
  'furniture': Sofa,
  'air-conditioning': Snowflake,
  'renovation': Hammer,
  'moving-services': Truck,
  'home-loans': Banknote,
  'mortgage-advisors': FileText,
};

const AllCategories: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-1 pb-20">
        {/* Header */}
        <div className="bg-primary/5 px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            חזרה
          </Button>
          <h1 className="text-3xl font-bold text-foreground">כל הקטגוריות</h1>
          <p className="text-muted-foreground mt-2">
            בחר קטגוריה כדי למצוא את הספקים המתאימים עבורך
          </p>
        </div>

        {/* Categories Grid */}
        <div className="px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category) => {
                const IconComponent = categoryIconMap[category.slug] || ChefHat;
                
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-destructive">
                            {category.supplier_count || 0} ספקים זמינים
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AllCategories;
