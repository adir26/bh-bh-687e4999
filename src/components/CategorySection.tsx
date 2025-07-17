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
    <div className="flex items-start w-full mb-4">
      <div className="flex items-start gap-4 overflow-x-auto px-4 py-2 w-full max-md:gap-3 max-sm:gap-3 max-sm:px-3">
        {items.map((item) => (
          <CategoryCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            onViewClick={() => onItemClick?.(item)}
            className={fixedWidth ? "w-60 min-w-60 max-sm:w-52 max-sm:min-w-52" : ""}
          />
        ))}
      </div>
    </div>
  );
};
