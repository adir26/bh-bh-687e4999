
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionTitleWithButtonProps {
  title: string;
  buttonText?: string;
  onButtonClick: () => void;
}

export const SectionTitleWithButton: React.FC<SectionTitleWithButtonProps> = ({ 
  title, 
  buttonText = "עוד", 
  onButtonClick 
}) => {
  return (
    <div className="flex items-center justify-between w-full px-3 xs:px-4 md:px-0 py-2 md:py-3">
      <h2 className="text-foreground text-lg xs:text-xl md:text-2xl font-bold leading-snug">{title}</h2>
      <Button 
        onClick={onButtonClick}
        variant="blue-secondary"
        size="sm"
        className="flex items-center gap-1 h-auto px-2 xs:px-3 py-1 text-xs xs:text-sm min-h-[44px]"
      >
        <span>{buttonText}</span>
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
};
