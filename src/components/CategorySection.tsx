
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
    <div className="flex items-start w-full mb-3 xs:mb-4 sm:mb-5">
      <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 overflow-x-auto smooth-scroll scrollbar-hide px-3 xs:px-4 sm:px-5 py-2 xs:py-3 w-full">
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
