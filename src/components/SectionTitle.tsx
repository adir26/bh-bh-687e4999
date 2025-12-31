import React from 'react';

interface SectionTitleProps {
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-start self-stretch pt-3 xs:pt-4 pb-1.5 xs:pb-2 px-3 xs:px-4">
      <h2 className="self-stretch text-foreground text-lg xs:text-xl font-bold leading-snug">
        {title}
      </h2>
    </div>
  );
};
