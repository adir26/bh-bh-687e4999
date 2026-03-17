import React, { useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { useSearchParams } from 'react-router-dom';
import { Filter, MapPin } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { SearchResults } from '@/components/SearchResults';
import { RecentSearches } from '@/components/RecentSearches';
import { useSearch } from '@/hooks/useSearch';

const Search = () => {
  const [searchParams] = useSearchParams();
  const {
    query,
    results,
    recentSearches,
    popularSearches,
    isLoading,
    selectedFilter,
    updateQuery,
    updateSelectedFilter,
    addToRecentSearches,
    removeRecentSearch,
    clearRecentSearches,
    hasResults
  } = useSearch();

  // Initialize search from URL query parameter
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery.trim()) {
      updateQuery(urlQuery.trim());
      addToRecentSearches(urlQuery.trim());
    }
  }, [searchParams]);

  // Updated filters to match DB data (removed 'services' and 'products')
  const searchFilters = [
    { id: 'all', label: 'הכל' },
    { id: 'suppliers', label: 'ספקים' },
    { id: 'categories', label: 'קטגוריות' }
  ];

  const handleSearchSubmit = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(query);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    updateQuery(search);
    handleSearchSubmit(search);
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background pb-nav-safe">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4 pt-[max(env(safe-area-inset-top),16px)] sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <SearchInput
              type="text"
              placeholder="חפש ספקים וקטגוריות..."
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={handleInputKeyPress}
              onClear={() => updateQuery("")}
              className="text-right rounded-xl"
              dir="rtl"
            />
          </div>
          <Button variant="blue-secondary" size="icon" className="rounded-xl">
            <Filter size={20} />
          </Button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={16} />
          <span className="text-sm">כל הארץ</span>
          <Button variant="ghost" size="sm" className="text-button-secondary-foreground hover:text-button-primary">
            שנה
          </Button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="px-4 py-3 border-b">
        <div className="flex gap-2 overflow-x-auto">
          {searchFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "blue" : "blue-secondary"}
              size="sm"
              onClick={() => updateSelectedFilter(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results or Default Content */}
      <div className="flex-1 px-4 py-4">
        {query.trim() ? (
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
            onResultClick={(item) => handleSearchSubmit(item.title)}
          />
        ) : (
          <RecentSearches
            searches={recentSearches}
            popularSearches={popularSearches}
            onSearchClick={handleRecentSearchClick}
            onRemoveSearch={removeRecentSearch}
            onClearAll={clearRecentSearches}
          />
        )}
      </div>
    </div>
  );
};

export default Search;
