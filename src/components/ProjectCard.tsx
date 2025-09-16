
import React from 'react';
import { Card, CardContent } from './ui/card';
import { SafeImage } from '@/utils/imageErrorHandling';

interface ProjectCardProps {
  name: string;
  image: string;
  description: string;
  location?: string;
  price?: string;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  name, 
  image, 
  description, 
  location, 
  price, 
  onClick 
}) => {
  return (
    <Card 
      className="w-52 min-w-52 xs:w-56 xs:min-w-56 sm:w-60 sm:min-w-60 mobile-card cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col">
        <div className="w-full h-28 xs:h-30 sm:h-32 overflow-hidden rounded-t-lg">
          <SafeImage 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
            showLoader={true}
          />
        </div>
        <div className="p-3 xs:p-4 flex flex-col items-center gap-1 xs:gap-2 text-center">
          <h3 className="font-semibold text-xs xs:text-sm text-center line-clamp-1 text-wrap-balance">{name}</h3>
          <p className="text-xs text-muted-foreground text-center line-clamp-2 text-wrap-balance">{description}</p>
          {location && (
            <p className="text-xs text-primary font-medium text-center text-wrap-balance">{location}</p>
          )}
          {price && (
            <p className="text-xs font-semibold text-green-600 text-center">{price}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
