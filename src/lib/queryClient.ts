import { QueryClient } from '@tanstack/react-query';

// OPTIMIZED: Slim Admin MVP Performance improvements
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 seconds
      gcTime: 300_000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: { 
      retry: 0 
    },
  },
});