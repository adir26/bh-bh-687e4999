import React, { useState } from 'react';

interface CategoryTag {
  id: string;
  name: string;
}

interface CategoryTagBarProps {
  categories: CategoryTag[];
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryTagBar: React.FC<CategoryTagBarProps> = ({ 
  categories, 
  onCategorySelect 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-start gap-3 overflow-x-auto px-4 py-2">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          הכל
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};