
import React from 'react';
import { Button } from './ui/button';

interface BottomCTAProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ 
  title, 
  buttonText, 
  onButtonClick 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onButtonClick) {
      onButtonClick();
    }
  };

  return (
    <div className="w-full bg-button-secondary py-8 px-4 pb-nav-safe text-center relative z-[70]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <Button 
        onClick={handleClick}
        variant="blue"
        size="lg"
        showArrow={true}
        className="px-8 py-2 min-h-touch pointer-events-auto touch-manipulation"
        style={{ touchAction: 'manipulation' }}
      >
        {buttonText}
      </Button>
    </div>
  );
};
