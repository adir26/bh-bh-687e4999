
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <Button 
        onClick={onButtonClick}
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-[#617385] text-sm font-medium hover:text-[#121417] transition-colors p-2 h-auto"
      >
        <span>{buttonText}</span>
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
};
