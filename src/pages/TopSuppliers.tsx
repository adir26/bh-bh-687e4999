import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SectionTitleWithButton } from '@/components/SectionTitleWithButton';
import { SupplierSection } from '@/components/SupplierSection';
import { useCategorySuppliers } from '@/hooks/useCategorySuppliers';
import { Supplier } from '@/data/suppliers';
import { Card } from '@/components/ui/card';

const TopSuppliers = () => {
  const navigate = useNavigate();

  // Load suppliers from database for each category
  const { data: renovationContractors = [], isLoading: loadingRenovation } = useCategorySuppliers('renovation');
  const { data: electricians = [], isLoading: loadingElectricians } = useCategorySuppliers('electricians');
  const { data: plumbers = [], isLoading: loadingPlumbers } = useCategorySuppliers('plumbers');
  const { data: airConditioningInstallers = [], isLoading: loadingAC } = useCategorySuppliers('air-conditioning');
  const { data: drywallContractors = [], isLoading: loadingDrywall } = useCategorySuppliers('drywall');
  const { data: interiorDesigners = [], isLoading: loadingDesigners } = useCategorySuppliers('interior-design');
  const { data: furnitureStores = [], isLoading: loadingFurniture } = useCategorySuppliers('furniture');
  const { data: mortgageAdvisors = [], isLoading: loadingMortgage } = useCategorySuppliers('mortgage-advisors');
  const { data: movingCompanies = [], isLoading: loadingMoving } = useCategorySuppliers('moving-services');

  // Event handlers
  const handleSupplierClick = (supplier: Supplier) => {
    // Navigate to real supplier profile using slug
    if (supplier.slug) {
      navigate(`/s/${supplier.slug}`);
    } else {
      navigate(`/supplier/${supplier.id}`);
    }
  };

  const handleAllSuppliersClick = (category: string) => {
    navigate(`/category/${category}/suppliers`);
  };

  // Empty state component
  const EmptyState = ({ category }: { category: string }) => (
    <Card className="p-6 text-center text-muted-foreground mx-3">
      אין ספקים זמינים בקטגוריה {category} כרגע
    </Card>
  );

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-start bg-white">
      <main className="flex flex-col items-start w-full bg-neutral-50 pb-nav-safe">
        <div className="flex flex-col items-start w-full">
          <Header userName="איתן" />
          
          <div className="w-full">
            <SectionTitleWithButton 
              title="קבלני שיפוצים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('renovation')}
            />
            {loadingRenovation ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : renovationContractors.length > 0 ? (
              <SupplierSection 
                suppliers={renovationContractors} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="קבלני שיפוצים" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חשמלאים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('electricians')}
            />
            {loadingElectricians ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : electricians.length > 0 ? (
              <SupplierSection 
                suppliers={electricians} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="חשמלאים" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="אינסטלטורים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('plumbers')}
            />
            {loadingPlumbers ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : plumbers.length > 0 ? (
              <SupplierSection 
                suppliers={plumbers} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="אינסטלטורים" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="מתקיני מיזוג אוויר" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('air-conditioning')}
            />
            {loadingAC ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : airConditioningInstallers.length > 0 ? (
              <SupplierSection 
                suppliers={airConditioningInstallers} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="מתקיני מיזוג אוויר" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="קבלני גבס" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('drywall')}
            />
            {loadingDrywall ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : drywallContractors.length > 0 ? (
              <SupplierSection 
                suppliers={drywallContractors} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="קבלני גבס" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="מעצבי פנים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('interior-design')}
            />
            {loadingDesigners ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : interiorDesigners.length > 0 ? (
              <SupplierSection 
                suppliers={interiorDesigners} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="מעצבי פנים" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חנויות רהיטים" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('furniture')}
            />
            {loadingFurniture ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : furnitureStores.length > 0 ? (
              <SupplierSection 
                suppliers={furnitureStores} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="חנויות רהיטים" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="יועצי משכנתאות" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('mortgage-advisors')}
            />
            {loadingMortgage ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : mortgageAdvisors.length > 0 ? (
              <SupplierSection 
                suppliers={mortgageAdvisors} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="יועצי משכנתאות" />
            )}
          </div>

          <div className="w-full">
            <SectionTitleWithButton 
              title="חברות הובלה" 
              buttonText="לכל הספקים"
              onButtonClick={() => handleAllSuppliersClick('moving-services')}
            />
            {loadingMoving ? (
              <div className="text-center py-4 text-muted-foreground">טוען...</div>
            ) : movingCompanies.length > 0 ? (
              <SupplierSection 
                suppliers={movingCompanies} 
                onSupplierClick={handleSupplierClick}
              />
            ) : (
              <EmptyState category="חברות הובלה" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopSuppliers;
