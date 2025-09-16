
import React from 'react';
import { SafeImage } from '@/utils/imageErrorHandling';

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
    <div className="flex items-start gap-4 xs:gap-6 sm:gap-8 w-full overflow-x-auto smooth-scroll scrollbar-hide px-4 xs:px-5 sm:px-6 py-3 xs:py-4 mb-4 xs:mb-5 sm:mb-6">
      {items.map((item) => (
        <button
          key={item.id}
          className="touch-target flex w-20 xs:w-24 min-w-20 xs:min-w-24 flex-col items-center gap-2 xs:gap-4 p-2 xs:p-3 rounded-lg hover:bg-accent mobile-transition focus-ring tap-highlight-transparent no-select"
          onClick={() => onItemClick?.(item)}
          aria-label={item.title}
        >
          <div className="flex flex-col items-center w-full">
            <SafeImage
              src={item.image}
              alt={item.title}
              className="w-12 h-12 xs:w-16 xs:h-16 rounded-full object-cover"
              loading="lazy"
              showLoader={true}
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="text-foreground text-center text-xs xs:text-sm font-medium leading-tight xs:leading-5 text-wrap-balance">
              {item.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
