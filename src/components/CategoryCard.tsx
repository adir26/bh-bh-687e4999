
import React from 'react';

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
    switch (size) {
      case 'small':
        return 'min-w-48 max-md:min-w-[160px] max-sm:min-w-[140px]';
      case 'large':
        return 'min-w-72 max-md:min-w-[240px] max-sm:min-w-[180px]';
      default:
        return 'min-w-60 max-md:min-w-[200px] max-sm:min-w-[160px]';
    }
  };

  const getImageSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-32 max-sm:h-[100px]';
      case 'large':
        return 'h-48 max-sm:h-[180px]';
      default:
        return 'h-40 max-sm:h-[150px]';
    }
  };

  return (
    <article className={`flex ${getSizeClasses()} flex-col items-center gap-4 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)] bg-white rounded-xl ${className}`}>
      <img
        src={image}
        alt={title}
        className={`${getImageSizeClasses()} w-full shrink-0 rounded-t-xl object-cover`}
      />
      <div className="flex flex-col items-center gap-4 flex-1 px-4 pb-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-[#121417] text-center text-base font-semibold leading-6">
            {title}
          </h3>
          <p className="text-[#617385] text-center text-sm font-normal leading-[21px]">
            {subtitle}
          </p>
        </div>
        <button
          className="flex h-10 min-w-[84px] max-w-[480px] justify-center items-center bg-[#EBEDF0] px-4 py-0 rounded-xl hover:bg-[#D1D5DB] transition-colors"
          onClick={onViewClick}
        >
          <span className="text-[#121417] text-center text-sm font-bold leading-[21px]">
            עוד
          </span>
        </button>
      </div>
    </article>
  );
};
