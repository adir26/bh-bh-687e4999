import React from 'react';
import { CategoryCard } from './CategoryCard';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
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
    <div className="flex items-start self-stretch">
      <div className="flex items-start gap-3 overflow-x-auto p-4 max-md:gap-4 max-sm:gap-3 max-sm:p-3">
        {items.map((item) => (
          <CategoryCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            onViewClick={() => onItemClick?.(item)}
            className={fixedWidth ? "w-60 h-[373px] min-w-60 max-sm:h-auto" : ""}
          />
        ))}
      </div>
    </div>
  );
};
