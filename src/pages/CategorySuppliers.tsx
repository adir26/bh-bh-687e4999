import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getSuppliersByCategory } from '@/data/suppliers';
import { SupplierCard } from '@/components/SupplierCard';

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
      'mortgage': 'יועצי משכנתאות',
      'moving': 'הובלות',
      'loans': 'הלוואות'
    };
    return titles[cat] || cat;
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">
          כל הספקים - {category && getCategoryTitle(category)}
        </span>
        <div className="w-10" />
      </div>

      {/* Suppliers Grid */}
      <div className="p-4">
        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#617385]">אין ספקים זמינים בקטגוריה זו</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="w-full">
                <SupplierCard
                  logo={supplier.logo}
                  name={supplier.name}
                  tagline={supplier.tagline}
                  onClick={() => navigate(`/supplier/${supplier.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySuppliers;