import { useState, useEffect, useCallback } from 'react';
import { searchItems, getPopularSearches, type SearchableItem } from '@/data/searchData';

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
    setIsLoading(true);
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      const searchResults = searchItems(searchQuery, searchFilters);
      setResults(searchResults);
      setIsLoading(false);
    }, 150);
  }, []);

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
    isLoading,
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