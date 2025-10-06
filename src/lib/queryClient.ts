import { QueryClient } from '@tanstack/react-query';

// OPTIMIZED: Phase 2 Performance improvements
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - increased from 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes - keep cached data longer
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      refetchOnReconnect: true, // Only refetch on reconnect
      throwOnError: false,
    },
    mutations: { 
      retry: 0 
    },
  },
});