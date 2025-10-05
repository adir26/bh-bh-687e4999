import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Droplets, 
  Sofa, 
  Snowflake, 
  Hammer, 
  Truck, 
  Banknote, 
  FileText,
  LucideIcon 
} from 'lucide-react';
import { usePopularCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

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

export const PopularCategories: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = usePopularCategories(6);

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-2">
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-2" dir="rtl">
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar md:grid md:grid-cols-6 md:gap-6">
        {categories.map((category) => {
          const IconComponent = categoryIconMap[category.slug] || ChefHat;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="flex flex-col items-center gap-2 min-w-[80px] group transition-transform hover:scale-105"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <IconComponent className="w-10 h-10 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {category.name}
                </p>
                <p className="text-xs text-destructive font-medium">
                  {category.supplier_count || 0} ספקים
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
