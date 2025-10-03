
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
  const handleStartNow = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault?.();
    e.stopPropagation?.();

    // prevent double taps
    if ((window as any).__starting) return;
    (window as any).__starting = true;

    Promise.resolve()
      .then(() => onButtonClick?.())
      .catch(err => console.error("Start Now error:", err))
      .finally(() => { (window as any).__starting = false; });
  };

  return (
    <div className="w-full bg-button-secondary py-4 px-4 pb-nav-safe text-center relative z-[70]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <Button 
        onClick={handleStartNow}
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
