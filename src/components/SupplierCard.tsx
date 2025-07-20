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
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
          <img 
            src={logo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{tagline}</p>
      </CardContent>
    </Card>
  );
};