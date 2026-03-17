import React from 'react';
import { SearchIcon, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentSearchesProps {
  searches: string[];
  popularSearches: string[];
  onSearchClick: (search: string) => void;
  onRemoveSearch: (search: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  popularSearches,
  onSearchClick,
  onRemoveSearch,
  onClearAll
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Recent Searches */}
      {searches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-right">חיפושים אחרונים</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
            >
              <Trash2 size={16} className="ml-1" />
              מחק הכל
            </Button>
          </div>
          <div className="space-y-1">
            {searches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between group hover:bg-muted/50 rounded-xl p-2 -mx-2"
              >
                <Button
                  variant="ghost"
                  className="flex-1 justify-start text-right hover:bg-transparent p-0 min-h-[44px]"
                  onClick={() => onSearchClick(search)}
                >
                  <SearchIcon size={16} className="ml-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{search}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSearch(search);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive min-h-[44px]"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-right">חיפושים פופולריים</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1">
          {popularSearches.map((search, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-right hover:bg-muted rounded-xl min-h-[44px]"
              onClick={() => onSearchClick(search)}
            >
              <SearchIcon size={16} className="ml-2 text-muted-foreground flex-shrink-0" />
              {search}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
