
import React from 'react';
import { SearchIcon, Filter, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategorySection } from '@/components/CategorySection';
import { SearchResults } from '@/components/SearchResults';
import { RecentSearches } from '@/components/RecentSearches';
import { useSearch } from '@/hooks/useSearch';

const Search = () => {
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

  const searchFilters = [
    { id: 'all', label: 'הכל' },
    { id: 'suppliers', label: 'ספקים' },
    { id: 'services', label: 'שירותים' },
    { id: 'products', label: 'מוצרים' }
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
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="חפש ספקים, שירותים ומוצרים..."
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={handleInputKeyPress}
              className="pr-10 text-right rounded-xl"
              dir="rtl"
            />
          </div>
          <Button variant="blue-secondary" size="icon" className="rounded-xl">
            <Filter size={20} />
          </Button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">תל אביב-יפו</span>
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
