import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the appropriate image URL for a storage path
 * Returns public URL for public content, signed URL for private content
 */
export async function getImageUrl(path: string, isPublic: boolean = true): Promise<string> {
  const bucket = supabase.storage.from('inspiration-photos');
  
  if (isPublic) {
    const { data } = bucket.getPublicUrl(path);
    return data.publicUrl;
  }
  
  // Create signed URL for private content (7 days expiry)
  const { data, error } = await bucket.createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
  
  return data.signedUrl;
}

/**
 * Synchronous version that only returns public URLs
 * Use this for public content that doesn't need signed URLs
 */
export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage.from('inspiration-photos').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Preload signed URLs for a list of private images
 * Useful for batch loading private content
 */
export async function preloadSignedUrls(paths: { path: string; isPublic: boolean }[]): Promise<Record<string, string>> {
  const urlMap: Record<string, string> = {};
  
  const promises = paths.map(async ({ path, isPublic }) => {
    try {
      const url = await getImageUrl(path, isPublic);
      urlMap[path] = url;
    } catch (error) {
      console.error(`Failed to load URL for ${path}:`, error);
      // Fallback to public URL if signed URL fails
      urlMap[path] = getPublicImageUrl(path);
    }
  });
  
  await Promise.all(promises);
  return urlMap;
}