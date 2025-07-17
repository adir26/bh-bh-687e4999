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
    <div className="flex items-start gap-6 w-full overflow-x-auto px-4 py-2 mb-4 max-md:gap-4 max-sm:gap-3 max-sm:px-3">
      {items.map((item) => (
        <button
          key={item.id}
          className="flex w-20 min-w-20 flex-col items-center gap-3 p-2 rounded-lg max-sm:w-16 max-sm:min-w-16 hover:bg-gray-50 transition-colors"
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex flex-col items-center w-full">
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-12 rounded-full object-cover max-sm:w-10 max-sm:h-10"
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="text-[#121417] text-center text-xs font-medium leading-4 max-sm:text-[10px] max-sm:leading-3">
              {item.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
