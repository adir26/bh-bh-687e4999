import React from 'react';
import { ChefHat, Sparkles, UserPlus, Flame, Trophy, LucideIcon } from 'lucide-react';

interface QuickSelectionItem {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
}

interface QuickSelectionProps {
  items: QuickSelectionItem[];
  onItemClick?: (item: QuickSelectionItem) => void;
}

// Default quick selection items with icons and gradients matching app style
export const defaultQuickSelectionItems: QuickSelectionItem[] = [
  {
    id: '1',
    title: 'מטבחים',
    icon: ChefHat,
    gradient: 'from-primary to-primary/70'
  },
  {
    id: '2',
    title: 'בלעדי לאפליקציה',
    icon: Sparkles,
    gradient: 'from-accent to-accent/70'
  },
  {
    id: '3',
    title: 'ספקים חדשים',
    icon: UserPlus,
    gradient: 'from-secondary to-secondary/70'
  },
  {
    id: '4',
    title: 'חם עכשיו',
    icon: Flame,
    gradient: 'from-destructive to-destructive/70'
  },
  {
    id: '5',
    title: 'המובילים',
    icon: Trophy,
    gradient: 'from-chart-4 to-chart-4/70'
  }
];

export const QuickSelection: React.FC<QuickSelectionProps> = ({ items, onItemClick }) => {
  return (
    <div className="w-full mb-4 xs:mb-5 sm:mb-6">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex items-start gap-3 xs:gap-4 sm:gap-6 w-full overflow-x-auto smooth-scroll scrollbar-hide px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className="touch-target flex w-16 xs:w-20 min-w-16 xs:min-w-20 flex-col items-center gap-2 xs:gap-3 p-2 rounded-xl hover:bg-accent/50 mobile-transition focus-ring tap-highlight-transparent no-select group"
              onClick={() => onItemClick?.(item)}
              aria-label={item.title}
            >
              <div className={`flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
                <IconComponent className="w-6 h-6 xs:w-7 xs:h-7 text-white" strokeWidth={2} />
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
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className="touch-target flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-accent/50 mobile-transition focus-ring tap-highlight-transparent no-select group"
              onClick={() => onItemClick?.(item)}
              aria-label={item.title}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
                <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
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
