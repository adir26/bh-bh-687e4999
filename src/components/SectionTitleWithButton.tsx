import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SectionTitleWithButtonProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
}

export const SectionTitleWithButton: React.FC<SectionTitleWithButtonProps> = ({ 
  title, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2">
      <h2 className="text-[#121417] text-xl font-bold leading-8">{title}</h2>
      <button 
        onClick={onButtonClick}
        className="flex items-center gap-1 text-[#617385] text-sm font-medium hover:text-[#121417] transition-colors"
      >
        <span>{buttonText}</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};