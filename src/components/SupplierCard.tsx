
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { SafeImage } from '@/utils/imageErrorHandling';

interface SupplierCardProps {
  logo: string;
  name: string;
  tagline: string;
  onClick?: () => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ 
  logo, 
  name, 
  tagline, 
  onClick 
}) => {
  return (
    <Card 
      className="w-36 min-w-36 xs:w-40 xs:min-w-40 sm:w-44 sm:min-w-44 md:min-w-0 md:w-full mobile-card hover:shadow-md transition-shadow bg-white pointer-events-auto"
    >
      <CardContent className="p-3 xs:p-4 flex flex-col items-center gap-2 xs:gap-3">
        <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted">
          <SafeImage 
            src={logo} 
            alt={name}
            className="w-full h-full object-cover"
            showLoader={true}
          />
        </div>
        <div className="flex flex-col items-center gap-2 xs:gap-3 text-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-semibold text-xs xs:text-sm text-center line-clamp-1 text-wrap-balance">{name}</h3>
            <p className="text-xs text-muted-foreground text-center line-clamp-2 text-wrap-balance">{tagline}</p>
          </div>
          <Button
            variant="blue-secondary"
            size="sm"
            className="mobile-button h-7 xs:h-8 px-2 xs:px-3 text-xs touch-manipulation"
            style={{ touchAction: 'manipulation' }}
            onClick={onClick}
          >
            עוד
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
