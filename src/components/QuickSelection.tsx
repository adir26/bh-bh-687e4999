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
    <div className="flex items-start gap-8 self-stretch overflow-x-auto p-4 max-md:gap-6 max-sm:gap-4 max-sm:p-3">
      {items.map((item) => (
        <button
          key={item.id}
          className="flex w-32 min-w-32 flex-col items-start gap-4 self-stretch pt-4 rounded-lg max-sm:w-[100px] max-sm:min-w-[100px] hover:bg-gray-50 transition-colors"
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex flex-col items-center">
            <img
              src={item.image}
              alt={item.title}
              className="flex-[1_0_0] self-stretch rounded-[64px]"
            />
          </div>
          <div className="flex flex-col items-center self-stretch">
            <span className="self-stretch text-[#121417] text-center text-base font-semibold leading-6 max-sm:text-sm max-sm:leading-5">
              {item.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
