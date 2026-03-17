import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/utils/imageErrorHandling';
import emptySearchImg from '@/assets/empty-search.png';
import type { SearchableItem } from '@/hooks/useSearch';

interface SearchResultsProps {
  results: SearchableItem[];
  query: string;
  isLoading: boolean;
  onResultClick?: (item: SearchableItem) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isLoading,
  onResultClick
}) => {
  const navigate = useNavigate();

  const handleResultClick = (item: SearchableItem) => {
    if (onResultClick) {
      onResultClick(item);
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-highlight text-highlight-foreground font-medium">
          {part}
        </span>
      ) : part
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'supplier': return 'ספק';
      case 'category': return 'קטגוריה';
      default: return '';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'supplier': return 'blue';
      case 'category': return 'purple';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="mr-3 text-muted-foreground">מחפש...</span>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="text-center py-12">
        <img src={emptySearchImg} alt="לא נמצאו תוצאות" className="w-32 h-32 mx-auto mb-4 object-contain opacity-70" />
        <div className="text-muted-foreground mb-2 text-lg">
          לא נמצאו תוצאות עבור "{query}"
        </div>
        <div className="text-sm text-muted-foreground">
          נסה לחפש במילים אחרות או בדוק את הכתיב
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-4">
        נמצאו {results.length} תוצאות עבור "{query}"
      </div>
      
      {/* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <Card 
            key={item.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleResultClick(item)}
          >
            <div className="flex gap-3">
              <SafeImage
                src={item.image}
                alt={item.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                showLoader={true}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-foreground text-right truncate">
                    {highlightText(item.title, query)}
                  </h3>
                  <Badge 
                    variant={getTypeBadgeVariant(item.type) as any}
                    className="text-xs whitespace-nowrap"
                  >
                    {getTypeLabel(item.type)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground text-right mb-2 line-clamp-2">
                  {highlightText(item.subtitle, query)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="fill-yellow-400 text-yellow-400" size={12} />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
