
import React from 'react';
import { Card, CardContent } from './ui/card';

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
      className="w-40 min-w-40 cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
          <img 
            src={logo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-3 text-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <h3 className="font-semibold text-sm text-center line-clamp-1">{name}</h3>
            <p className="text-xs text-muted-foreground text-center line-clamp-2">{tagline}</p>
          </div>
          <button
            className="flex h-8 min-w-[60px] max-w-[120px] justify-center items-center bg-[#EBEDF0] px-3 py-0 rounded-lg hover:bg-[#D1D5DB] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <span className="text-[#121417] text-center text-xs font-bold leading-[18px]">
              עוד
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
