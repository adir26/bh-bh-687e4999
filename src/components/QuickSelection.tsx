import React from 'react';

interface QuickSelectionItem {
  id: string;
  title: string;
  image: string;
}

interface QuickSelectionProps {
  items: QuickSelectionItem[];
  onItemClick?: (item: QuickSelectionItem) => void;
}

export const QuickSelection: React.FC<QuickSelectionProps> = ({ items, onItemClick }) => {
  return (
    <div className="flex items-start gap-8 w-full overflow-x-auto px-6 py-3 mb-6 max-md:gap-5 max-sm:gap-4 max-sm:px-4">
      {items.map((item) => (
        <button
          key={item.id}
          className="flex w-24 min-w-24 flex-col items-center gap-4 p-3 rounded-lg max-sm:w-18 max-sm:min-w-18 hover:bg-gray-50 transition-colors"
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex flex-col items-center w-full">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 rounded-full object-cover max-sm:w-12 max-sm:h-12"
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="text-[#121417] text-center text-sm font-medium leading-5 max-sm:text-xs max-sm:leading-4">
              {item.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
