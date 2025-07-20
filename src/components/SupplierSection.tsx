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
    <div className="flex items-start w-full mb-4">
      <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full max-md:gap-3 max-sm:gap-3 max-sm:px-3">
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