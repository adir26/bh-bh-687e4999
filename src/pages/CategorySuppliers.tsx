import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { getSuppliersByCategory } from '@/data/suppliers';

const CategorySuppliers = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const suppliers = category ? getSuppliersByCategory(category) : [];

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
      'mortgage': 'יועצי משכנתאות',
      'moving': 'הובלות',
      'loans': 'הלוואות'
    };
    return titles[cat] || cat;
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">
          כל הספקים - {category && getCategoryTitle(category)}
        </span>
        <div className="w-10" />
      </div>

      {/* Category Title */}
      <div className="px-6 py-4 bg-white">
        <h1 className="text-3xl font-bold text-right text-[#121417]">
          {category && getCategoryTitle(category)}
        </h1>
      </div>

      {/* Suppliers List */}
      <div className="flex-1 bg-gray-50 px-4 py-2">
        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#617385]">אין ספקים זמינים בקטגוריה זו</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/supplier/${supplier.id}`)}
              >
                {/* Supplier Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={supplier.logo} 
                    alt={supplier.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Favorite Button */}
                  <button 
                    className="absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast.success("נוסף לרשימת המועדפים");
                    }}
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Premium Badge */}
                  {supplier.rating >= 4.8 && (
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-gray-700">פרימיום</span>
                    </div>
                  )}
                </div>

                {/* Supplier Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 text-right">
                      <h3 className="text-lg font-semibold text-[#121417] mb-1">
                        {supplier.name}
                      </h3>
                      <p className="text-sm text-[#617385]">
                        {supplier.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Rating and Info */}
                  <div className="flex items-center justify-between mt-3 text-sm text-[#617385]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{supplier.rating}</span>
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