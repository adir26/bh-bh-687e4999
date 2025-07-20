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
        return 'min-w-48 h-48 max-md:min-w-[160px] max-sm:min-w-[140px]';
      case 'large':
        return 'min-w-72 h-72 max-md:min-w-[240px] max-sm:min-w-[180px]';
      default:
        return 'min-w-60 h-60 max-md:min-w-[200px] max-sm:min-w-[160px]';
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
    <article className={`flex ${getSizeClasses()} flex-col items-start gap-4 flex-[1_0_0] self-stretch shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)] bg-white rounded-xl ${className}`}>
      <img
        src={image}
        alt={title}
        className={`${getImageSizeClasses()} shrink-0 self-stretch rounded-t-xl object-cover`}
      />
      <div className="flex flex-col justify-between items-start flex-[1_0_0] self-stretch pt-0 pb-4 px-4">
        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col items-start self-stretch">
            <h3 className="self-stretch text-[#121417] text-center text-base font-semibold leading-6">
              {title}
            </h3>
          </div>
          <div className="flex flex-col items-start self-stretch">
            <p className="self-stretch text-[#617385] text-center text-sm font-normal leading-[21px]">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          className="flex h-10 min-w-[84px] max-w-[480px] justify-center items-center self-stretch bg-[#EBEDF0] px-4 py-0 rounded-xl hover:bg-[#D1D5DB] transition-colors"
          onClick={onViewClick}
        >
          <span className="self-stretch overflow-hidden text-[#121417] text-center text-ellipsis text-sm font-bold leading-[21px]">
            עוד
          </span>
        </button>
      </div>
    </article>
  );
};
