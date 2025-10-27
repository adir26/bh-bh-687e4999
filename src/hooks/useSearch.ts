import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchableCategories, searchableServices, getPopularSearches, type SearchableItem } from '@/data/searchData';
import { useSearchableCompanies } from './useSearchableCompanies';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 8;

export interface SearchFilters {
  type?: 'category' | 'supplier' | 'service';
  category?: string;
  location?: string;
  minRating?: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Fetch dynamic suppliers from Supabase
  const { data: dynamicCompanies = [], isLoading: isLoadingCompanies } = useSearchableCompanies();
  
  // Convert dynamic companies to searchable items
  const searchableSuppliers = useMemo<SearchableItem[]>(() => {
    return dynamicCompanies.map(company => ({
      id: company.id,
      title: company.name,
      subtitle: company.tagline || '',
      image: company.logo_url || '/placeholder.svg',
      type: 'supplier' as const,
      category: company.company_categories?.[0]?.category?.slug,
      location: `${company.city || ''} ${company.area || ''}`.trim() || undefined,
      rating: company.rating || undefined,
      keywords: [
        company.name,
        company.tagline || '',
        company.description || '',
        company.city || '',
        company.area || '',
        ...(company.company_categories?.map(cc => cc.category?.name || '').filter(Boolean) || [])
      ].filter(Boolean),
      route: `/s/${company.slug}`
    }));
  }, [dynamicCompanies]);
  
  // Combine all searchable items
  const allSearchableItems = useMemo<SearchableItem[]>(() => [
    ...searchableCategories,
    ...searchableSuppliers,
    ...searchableServices
  ], [searchableSuppliers]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, []);

  // Perform search
  const performSearch = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      let filteredItems = allSearchableItems;

      // Apply filters
      if (searchFilters?.type) {
        filteredItems = filteredItems.filter(item => item.type === searchFilters.type);
      }
      if (searchFilters?.category) {
        filteredItems = filteredItems.filter(item => item.category === searchFilters.category);
      }
      if (searchFilters?.location) {
        filteredItems = filteredItems.filter(item => 
          item.location?.toLowerCase().includes(searchFilters.location!.toLowerCase())
        );
      }
      if (searchFilters?.minRating) {
        filteredItems = filteredItems.filter(item => 
          item.rating ? item.rating >= searchFilters.minRating! : true
        );
      }

      // Search in keywords, title, and subtitle
      const searchResults = filteredItems.filter(item => {
        const searchableText = [
          item.title.toLowerCase(),
          item.subtitle.toLowerCase(),
          item.location?.toLowerCase() || '',
          ...item.keywords.map(k => k.toLowerCase())
        ].join(' ');

        return searchableText.includes(normalizedQuery);
      });

      // Sort by relevance
      const sortedResults = searchResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(normalizedQuery) ? 2 : 0;
        const bTitle = b.title.toLowerCase().includes(normalizedQuery) ? 2 : 0;
        const aSubtitle = a.subtitle.toLowerCase().includes(normalizedQuery) ? 1 : 0;
        const bSubtitle = b.subtitle.toLowerCase().includes(normalizedQuery) ? 1 : 0;
        
        const aScore = aTitle + aSubtitle + (a.rating || 0);
        const bScore = bTitle + bSubtitle + (b.rating || 0);
        
        return bScore - aScore;
      });

      setResults(sortedResults);
      setIsLoading(false);
    }, 150);
  }, [allSearchableItems]);

  // Update search query and perform search
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      performSearch(newQuery, filters);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [filters, performSearch]);

  // Update filters and re-search
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (query.trim()) {
      performSearch(query, newFilters);
    }
  }, [query, performSearch]);

  // Add search to recent searches
  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updatedSearches);
    saveRecentSearches(updatedSearches);
  }, [recentSearches, saveRecentSearches]);

  // Remove individual recent search
  const removeRecentSearch = useCallback((searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updatedSearches);
    saveRecentSearches(updatedSearches);
  }, [recentSearches, saveRecentSearches]);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecentSearches([]);
  }, [saveRecentSearches]);

  // Get popular searches
  const popularSearches = getPopularSearches();

  // Update selected filter and apply corresponding filters
  const updateSelectedFilter = useCallback((filterType: string) => {
    setSelectedFilter(filterType);
    
    let newFilters: SearchFilters = {};
    switch (filterType) {
      case 'suppliers':
        newFilters.type = 'supplier';
        break;
      case 'services':
        newFilters.type = 'service';
        break;
      case 'products':
        newFilters.type = 'category';
        break;
      default:
        newFilters = {};
    }
    
    updateFilters(newFilters);
  }, [updateFilters]);

  return {
    query,
    results,
    recentSearches,
    popularSearches,
    isLoading: isLoading || isLoadingCompanies,
    filters,
    selectedFilter,
    updateQuery,
    updateFilters,
    updateSelectedFilter,
    addToRecentSearches,
    removeRecentSearch,
    clearRecentSearches,
    hasResults: results.length > 0,
    hasRecentSearches: recentSearches.length > 0
  };
}