import React from 'react';

interface SectionTitleProps {
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-start self-stretch pt-4 pb-2 px-4 max-sm:pt-3 max-sm:pb-1.5 max-sm:px-3">
      <h2 className="self-stretch text-[#121417] text-right text-lg font-bold leading-[23px] max-sm:text-base max-sm:leading-5">
        {title}
      </h2>
    </div>
  );
};
