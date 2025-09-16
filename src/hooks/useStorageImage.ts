import { useQuery } from '@tanstack/react-query';
import { getImageUrl, getPublicImageUrl } from '@/utils/imageUrls';

interface UseStorageImageOptions {
  path: string;
  isPublic?: boolean;
  enabled?: boolean;
}

/**
 * Hook for stable Supabase storage image URLs
 * Prevents infinite re-creation of signed URLs
 */
export function useStorageImage({ path, isPublic = true, enabled = true }: UseStorageImageOptions) {
  return useQuery({
    queryKey: ['storage-image', path, isPublic],
    queryFn: async () => {
      if (!path) return null;
      
      try {
        if (isPublic) {
          return getPublicImageUrl(path);
        } else {
          return await getImageUrl(path, false);
        }
      } catch (error) {
        console.error('Failed to get storage image URL:', error);
        return null;
      }
    },
    enabled: enabled && !!path,
    staleTime: isPublic ? Infinity : 1000 * 60 * 60 * 6, // Public URLs never stale, signed URLs 6 hours
    gcTime: isPublic ? Infinity : 1000 * 60 * 60 * 24, // Cache signed URLs for 24 hours
    retry: 1,
  });
}