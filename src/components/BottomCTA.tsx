import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface BottomCTAProps {
  title: string;
  buttonText: string;
  href?: string;
  onButtonClick?: () => void;
  show?: boolean;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({ 
  title, 
  buttonText,
  href = '/welcome',
  onButtonClick,
  show = true
}) => {
  if (!show) return null;
  
  const handleClick = () => {
    onButtonClick?.();
  };

  return (
    <div className="w-full mx-4 mb-6 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 py-8 px-6 pb-nav-safe text-center relative z-[70] border border-border/50 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-5">
        {title}
      </h2>
      <Link 
        to={href}
        onClick={handleClick}
        className="inline-block"
      >
        <Button 
          variant="blue"
          size="lg"
          className="px-10 py-3 min-h-touch pointer-events-auto touch-manipulation inline-flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          style={{ touchAction: 'manipulation' }}
          data-testid="start-now-bottom"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};
