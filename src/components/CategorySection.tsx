
import React from 'react';
import { CategoryCard } from './CategoryCard';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  size?: 'small' | 'medium' | 'large';
}

interface CategorySectionProps {
  items: CategoryItem[];
  onItemClick?: (item: CategoryItem) => void;
  fixedWidth?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  items, 
  onItemClick,
  fixedWidth = false 
}) => {
  return (
    <div className="flex items-start w-full mb-4 xs:mb-5 sm:mb-6">
      <div className="flex items-start gap-3 xs:gap-4 sm:gap-4 overflow-x-auto smooth-scroll scrollbar-hide px-4 xs:px-5 sm:px-6 py-2 xs:py-3 w-full">
        {items.map((item) => (
          <CategoryCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            onViewClick={() => onItemClick?.(item)}
            size={item.size}
            className={fixedWidth ? "flex-shrink-0" : "flex-shrink-0"}
          />
        ))}
      </div>
    </div>
  );
};
