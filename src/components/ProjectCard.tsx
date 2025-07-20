
import React from 'react';
import { Card, CardContent } from './ui/card';

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
      className="w-60 min-w-60 cursor-pointer hover:shadow-md transition-shadow bg-white"
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col">
        <div className="w-full h-32 overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex flex-col items-center gap-2 text-center">
          <h3 className="font-semibold text-sm text-center line-clamp-1">{name}</h3>
          <p className="text-xs text-muted-foreground text-center line-clamp-2">{description}</p>
          {location && (
            <p className="text-xs text-primary font-medium text-center">{location}</p>
          )}
          {price && (
            <p className="text-xs font-semibold text-green-600 text-center">{price}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
