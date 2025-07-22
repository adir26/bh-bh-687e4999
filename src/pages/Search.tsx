
import React, { useState } from 'react';
import { SearchIcon, Filter, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategorySection } from '@/components/CategorySection';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const searchFilters = [
    { id: 'all', label: 'הכל' },
    { id: 'suppliers', label: 'ספקים' },
    { id: 'services', label: 'שירותים' },
    { id: 'products', label: 'מוצרים' }
  ];

  const popularCategories = [
    {
      id: '1',
      title: 'מטבחים מעוצבים',
      subtitle: 'מטבחים',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=480&h=480&fit=crop'
    },
    {
      id: '2',
      title: 'שיפוצי בתים',
      subtitle: 'שיפוצים',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=480&h=480&fit=crop'
    },
    {
      id: '3',
      title: 'ריהוט מודרני',
      subtitle: 'ריהוט',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=480&h=480&fit=crop'
    }
  ];

  const recentSearches = [
    'מטבחים בתל אביב',
    'שיפוצי דירות',
    'מיזוג אוויר',
    'יועץ משכנתאות'
  ];

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onClick={() => setSelectedFilter(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results or Default Content */}
      <div className="flex-1 px-4 py-4">
        {searchQuery ? (
          <div>
            <p className="text-gray-600 mb-4">מחפש "{searchQuery}"...</p>
            {/* Search results would go here */}
          </div>
        ) : (
          <div>
            {/* Recent Searches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-right">חיפושים אחרונים</h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-right hover:bg-button-secondary rounded-xl"
                    onClick={() => setSearchQuery(search)}
                  >
                    <SearchIcon size={16} className="ml-2" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-right">קטגוריות פופולריות</h3>
              <CategorySection items={popularCategories} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
