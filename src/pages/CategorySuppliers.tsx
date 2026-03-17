import React from 'react';
import { SEO } from '@/components/SEO';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { useCategorySuppliers } from '@/hooks/useCategorySuppliers';
import { EmptyState } from '@/components/ui/empty-state';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CategorySuppliers = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  const { data: suppliers = [], isLoading } = useCategorySuppliers(category || '');

  const getCategoryTitle = (cat: string) => {
    const titles: { [key: string]: string } = {
      'kitchens': 'מטבחים',
      'furniture': 'ריהוט',
      'air-conditioning': 'מיזוג אוויר',
      'renovation': 'שיפוצים',
      'bathroom': 'חדרי רחצה',
      'bedroom': 'חדרי שינה',
      'garden': 'גינות',
      'living-room': 'סלון',
      'mortgage-advisors': 'יועצי משכנתאות',
      'moving-services': 'הובלות',
      'home-loans': 'הלוואות'
    };
    return titles[cat] || cat;
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-[max(env(safe-area-inset-top),12px)] border-b bg-card sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px]">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground">
          {category && getCategoryTitle(category)}
        </span>
        <div className="w-10" />
      </div>

      {/* Suppliers List */}
      <div className="flex-1 bg-muted/30 px-4 py-4 pb-nav-safe space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">טוען ספקים...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={Store}
              title="אין ספקים זמינים"
              description="לא נמצאו ספקים בקטגוריה זו כרגע"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-card rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-border/50 overflow-hidden"
                onClick={() => navigate(supplier.slug ? `/s/${supplier.slug}` : `/supplier/${supplier.id}`)}
              >
                {/* Supplier Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={supplier.logo} 
                    alt={supplier.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Favorite Button */}
                  <button 
                    className="absolute top-3 start-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast.success("נוסף לרשימת המועדפים");
                    }}
                  >
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </button>
                  
                  {/* Premium Badge */}
                  {supplier.rating >= 4.8 && (
                    <div className="absolute top-3 end-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-foreground">פרימיום</span>
                    </div>
                  )}
                </div>

                {/* Supplier Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 text-right">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {supplier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {supplier.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Rating and Info */}
                  <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">{supplier.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{supplier.reviewCount} ביקורות</span>
                      <span>•</span>
                      <span>{supplier.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySuppliers;
