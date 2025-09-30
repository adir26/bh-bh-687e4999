import React from 'react';
import { SupplierCard } from './SupplierCard';
import { Supplier } from '@/data/suppliers';

interface SupplierSectionProps {
  suppliers: Supplier[];
  onSupplierClick?: (supplier: Supplier) => void;
}

export const SupplierSection: React.FC<SupplierSectionProps> = ({ 
  suppliers, 
  onSupplierClick 
}) => {
  return (
    <div className="w-full mb-3 xs:mb-4 sm:mb-5">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex items-start gap-2 xs:gap-3 sm:gap-4 overflow-x-auto smooth-scroll scrollbar-hide px-3 xs:px-4 sm:px-5 py-2 xs:py-3 w-full">
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            logo={supplier.logo}
            name={supplier.name}
            tagline={supplier.tagline}
            onClick={() => onSupplierClick?.(supplier)}
          />
        ))}
      </div>
      {/* Tablet+: responsive grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-3 xs:px-4 sm:px-5">
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            logo={supplier.logo}
            name={supplier.name}
            tagline={supplier.tagline}
            onClick={() => onSupplierClick?.(supplier)}
          />
        ))}
      </div>
    </div>
  );
};