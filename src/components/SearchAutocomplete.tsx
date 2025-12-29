import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Building2, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearch, type SearchableItem } from '@/hooks/useSearch';

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = "חפש ספקים וקטגוריות...",
  className,
  onSearch
}) => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    results,
    popularSearches,
    isLoading,
    updateQuery,
    addToRecentSearches
  } = useSearch();

  // Show dropdown when focused and has query or results
  useEffect(() => {
    setShowDropdown(isFocused && (query.length > 0 || results.length > 0));
  }, [isFocused, query, results.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      addToRecentSearches(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      onSearch?.(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (item: SearchableItem) => {
    addToRecentSearches(item.title);
    setShowDropdown(false);
    if (item.route) {
      navigate(item.route);
    }
  };

  const handlePopularClick = (search: string) => {
    updateQuery(search);
    addToRecentSearches(search);
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    updateQuery('');
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier': return <Building2 size={14} className="text-primary" />;
      case 'category': return <FolderOpen size={14} className="text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pr-10 text-right rounded-xl transition-all",
            query && "pl-10"
          )}
          dir="rtl"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted-foreground/10 rounded-full"
            onClick={handleClear}
            tabIndex={-1}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-primary" size={20} />
              <span className="mr-2 text-sm text-muted-foreground">מחפש...</span>
            </div>
          )}

          {!isLoading && query.trim() && results.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs text-muted-foreground font-medium">
                תוצאות ({results.length})
              </div>
              {results.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-right transition-colors"
                  onClick={() => handleResultClick(item)}
                >
                  <div className="flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                    )}
                  </div>
                  {item.location && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {item.location}
                    </div>
                  )}
                </button>
              ))}
              {results.length > 6 && (
                <button
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-muted text-center"
                  onClick={handleSearch}
                >
                  הצג את כל {results.length} התוצאות
                </button>
              )}
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              לא נמצאו תוצאות עבור "{query}"
            </div>
          )}

          {!isLoading && !query.trim() && popularSearches.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs text-muted-foreground font-medium">
                חיפושים פופולריים
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-right transition-colors"
                  onClick={() => handlePopularClick(search)}
                >
                  <Search size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
