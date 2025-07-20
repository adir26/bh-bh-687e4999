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
  return (
    <div className="w-full bg-blue-50 py-8 px-4 text-center">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <Button 
        onClick={onButtonClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
      >
        {buttonText}
      </Button>
    </div>
  );
};