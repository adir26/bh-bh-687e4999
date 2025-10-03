import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface BottomCTAProps {
  title: string;
  buttonText: string;
  href?: string;
  onButtonClick?: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ 
  title, 
  buttonText,
  href = '/welcome',
  onButtonClick 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Optional callback for additional logic (e.g., tracking, modal opening)
    onButtonClick?.();
  };

  return (
    <div className="w-full bg-button-secondary py-4 px-4 pb-nav-safe text-center relative z-[70]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <Button 
        asChild
        variant="blue"
        size="lg"
        showArrow={true}
        className="px-8 py-2 min-h-touch"
        data-testid="start-now"
      >
        <Link to={href} onClick={handleClick}>
          {buttonText}
        </Link>
      </Button>
    </div>
  );
};
