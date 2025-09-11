import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateQuery = useCallback(
    (queryKey: (string | undefined)[]) => {
      // Filter out undefined values and ensure we have a valid query key
      const validKey = queryKey.filter(Boolean);
      if (validKey.length > 0) {
        queryClient.invalidateQueries({ queryKey: validKey });
      }
    },
    [queryClient]
  );

  const invalidateMultiple = useCallback(
    (queryKeys: (string | undefined)[][]) => {
      queryKeys.forEach((key) => invalidateQuery(key));
    },
    [invalidateQuery]
  );

  return {
    invalidateQuery,
    invalidateMultiple,
    // Specific invalidators for common use cases
    invalidateIdeabook: useCallback((id: string, userId?: string) => 
      invalidateQuery(['ideabook', id, userId]), [invalidateQuery]),
    invalidatePhoto: useCallback((id: string, userId?: string) => 
      invalidateQuery(['photo', id, userId]), [invalidateQuery]),
    invalidateQuote: useCallback((id: string, userId?: string) => 
      invalidateQuery(['quote', id, userId]), [invalidateQuery]),
    invalidateMeetings: useCallback((userId?: string) => 
      invalidateQuery(['meetings', userId]), [invalidateQuery]),
    invalidateLeads: useCallback((userId?: string) => 
      invalidateQuery(['leads', userId]), [invalidateQuery]),
  };
};