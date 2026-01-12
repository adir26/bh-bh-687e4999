import React from 'react';

// Import 3D icons
import kitchensIcon from '@/assets/quick-selection/kitchens.png';
import appExclusiveIcon from '@/assets/quick-selection/app-exclusive.png';
import newSuppliersIcon from '@/assets/quick-selection/new-suppliers.png';
import hotNowIcon from '@/assets/quick-selection/hot-now.png';
import topLeadersIcon from '@/assets/quick-selection/top-leaders.png';

interface QuickSelectionItem {
  id: string;
  title: string;
  image: string;
}

interface QuickSelectionProps {
  items: QuickSelectionItem[];
  onItemClick?: (item: QuickSelectionItem) => void;
}

// Default quick selection items with 3D icons
export const defaultQuickSelectionItems: QuickSelectionItem[] = [
  {
    id: '1',
    title: 'מטבחים',
    image: kitchensIcon
  },
  {
    id: '2',
    title: 'בלעדי לאפליקציה',
    image: appExclusiveIcon
  },
  {
    id: '3',
    title: 'ספקים חדשים',
    image: newSuppliersIcon
  },
  {
    id: '4',
    title: 'חם עכשיו',
    image: hotNowIcon
  },
  {
    id: '5',
    title: 'המובילים',
    image: topLeadersIcon
  }
];

export const QuickSelection: React.FC<QuickSelectionProps> = ({ items, onItemClick }) => {
  return (
    <div className="w-full mb-4 xs:mb-5 sm:mb-6">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex items-start gap-3 xs:gap-4 sm:gap-6 w-full overflow-x-auto smooth-scroll scrollbar-hide px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
        {items.map((item) => {
          return (
            <button
              key={item.id}
              className="touch-target flex w-20 xs:w-24 min-w-20 xs:min-w-24 flex-col items-center gap-2 xs:gap-3 p-2 rounded-xl hover:bg-accent/50 mobile-transition focus-ring tap-highlight-transparent no-select group"
              onClick={() => onItemClick?.(item)}
              aria-label={item.title}
            >
              <div className="flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 group-hover:scale-105 transition-all duration-200">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-12 h-12 xs:w-14 xs:h-14 object-contain drop-shadow-sm"
                />
              </div>
              <span className="text-foreground text-center text-[10px] xs:text-xs font-medium leading-tight text-wrap-balance line-clamp-2">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Tablet+: responsive grid */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
        {items.map((item) => {
          return (
            <button
              key={item.id}
              className="touch-target flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-accent/50 mobile-transition focus-ring tap-highlight-transparent no-select group"
              onClick={() => onItemClick?.(item)}
              aria-label={item.title}
            >
              <div className="flex items-center justify-center w-12 h-12 group-hover:scale-105 transition-all duration-200">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-12 h-12 object-contain drop-shadow-sm"
                />
              </div>
              <span className="text-foreground text-center text-sm font-medium leading-5 text-wrap-balance">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
