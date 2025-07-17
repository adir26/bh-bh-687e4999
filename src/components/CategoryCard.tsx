import React from 'react';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
  onViewClick?: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  onViewClick,
  className = ""
}) => {
  return (
    <article className={`flex min-w-60 flex-col items-start gap-4 flex-[1_0_0] self-stretch shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)] bg-neutral-50 rounded-xl max-md:min-w-[200px] max-sm:min-w-[180px] ${className}`}>
      <img
        src={image}
        alt={title}
        className="h-60 shrink-0 self-stretch rounded-xl max-sm:h-[180px]"
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
            View
          </span>
        </button>
      </div>
    </article>
  );
};
