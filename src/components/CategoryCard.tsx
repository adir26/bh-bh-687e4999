
import React from 'react';
import { SafeImage } from '@/utils/imageErrorHandling';
import { Button } from './ui/button';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
  onViewClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  onViewClick,
  className = "",
  size = "medium"
}) => {
  const getSizeClasses = () => {
    // On mobile: fixed widths for horizontal scroll
    // On tablet+: no width constraints (flex to grid cell)
    switch (size) {
      case 'small':
        return 'min-w-36 w-36 xs:min-w-40 xs:w-40 sm:min-w-48 sm:w-48 md:min-w-0 md:w-full';
      case 'large':
        return 'min-w-52 w-52 xs:min-w-60 xs:w-60 sm:min-w-72 sm:w-72 md:min-w-0 md:w-full';
      default:
        return 'min-w-44 w-44 xs:min-w-52 xs:w-52 sm:min-w-60 sm:w-60 md:min-w-0 md:w-full';
    }
  };

  const getImageSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-24 xs:h-28 sm:h-32';
      case 'large':
        return 'h-36 xs:h-40 sm:h-48';
      default:
        return 'h-32 xs:h-36 sm:h-40';
    }
  };

  return (
    <article className={`mobile-card flex ${getSizeClasses()} flex-col pointer-events-auto ${className}`}>
      <SafeImage
        src={image}
        alt={title}
        className={`${getImageSizeClasses()} w-full shrink-0 rounded-t-xl object-cover md:aspect-[4/3]`}
        loading="lazy"
        showLoader={true}
      />
      <div className="flex flex-col items-center gap-3 xs:gap-4 flex-1 p-3 xs:p-4">
        <div className="flex flex-col items-center gap-1 xs:gap-2 text-center">
          <h3 className="text-foreground text-center text-sm xs:text-base font-semibold leading-tight xs:leading-6 text-wrap-balance">
            {title}
          </h3>
          <p className="text-muted-foreground text-center text-xs xs:text-sm font-normal leading-tight xs:leading-5 text-wrap-balance">
            {subtitle}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mobile-button h-9 xs:h-10 min-w-20 xs:min-w-[84px] max-w-[480px] touch-manipulation"
          onClick={onViewClick}
          aria-label={`עוד על ${title}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-center text-xs xs:text-sm font-bold leading-tight xs:leading-5">
            עוד
          </span>
        </Button>
      </div>
    </article>
  );
};
