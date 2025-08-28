import { supabase } from '@/integrations/supabase/client';
import { Photo, FilterOptions, UploadPhotoData } from '@/types/inspiration';
import { getPublicImageUrl } from '@/utils/imageUrls';

export class InspirationsService {
  static async search(options: FilterOptions = {}): Promise<Photo[]> {
    let query = supabase
      .from('photos')
      .select(`
        id, title, description, room, style, storage_path, is_public, 
        created_at, updated_at, uploader_id, company_id, width, height,
        photo_likes(user_id),
        photo_tags(tag)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: options.sortBy === 'oldest' });

    if (options.room && options.room !== 'all') {
      query = query.eq('room', options.room);
    }

    if (options.style && options.style !== 'all') {
      query = query.eq('style', options.style);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options.tags && options.tags.length > 0) {
      // Filter by tags using EXISTS subquery
      const tagFilters = options.tags.map(tag => 
        `photo_tags.some.tag.eq.${tag}`
      ).join(',');
      query = query.or(tagFilters);
    }

    const { data, error } = await query;
    if (error) throw error;

    return this.processPhotoData(data || []);
  }

  static async getById(id: string, userId?: string): Promise<Photo | null> {
    const { data, error } = await supabase
      .from('photos')
      .select(`
        id, title, description, room, style, storage_path, is_public,
        created_at, updated_at, uploader_id, company_id, width, height,
        photo_likes(user_id),
        photo_tags(tag)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const processedPhotos = this.processPhotoData([data], userId);
    return processedPhotos[0] || null;
  }

  static async create(payload: UploadPhotoData, imageFile: File): Promise<Photo> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Upload image to storage
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('inspiration-photos')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    // Create photo record
    const { data, error } = await supabase
      .from('photos')
      .insert({
        title: payload.title,
        description: payload.description,
        room: payload.room,
        style: payload.style,
        storage_path: filePath,
        is_public: payload.is_public,
        uploader_id: user.id,
        width: 800, // Will be updated with actual dimensions later
        height: 600
      })
      .select()
      .single();

    if (error) throw error;

    // Add tags if provided
    if (payload.tags.length > 0) {
      const tagInserts = payload.tags.map(tag => ({
        photo_id: data.id,
        tag
      }));

      await supabase.from('photo_tags').insert(tagInserts);
    }

    return this.processPhotoData([data])[0];
  }

  static async tagProduct(photoId: string, productId: string, hotspot?: { x: number; y: number }, note?: string): Promise<void> {
    // Note: Using existing product_tags table structure based on types
    // This functionality may need the actual table to be created
    const { error } = await supabase
      .from('user_favorites') // Placeholder - need to create proper product_tags table
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        entity_type: 'product',
        entity_id: productId
      });

    if (error) throw error;
  }

  static async tagSupplier(photoId: string, supplierId: string, role: string = 'supplier'): Promise<void> {
    // Note: This functionality requires creating the inspiration_supplier_tags table
    // For now, we'll add the supplier to favorites as a workaround
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        entity_type: 'supplier',
        entity_id: supplierId
      });

    if (error) throw error;
  }

  private static processPhotoData(rawPhotos: any[], userId?: string): Photo[] {
    return rawPhotos.map(photo => ({
      ...photo,
      likes: photo.photo_likes?.length || 0,
      is_liked: userId ? photo.photo_likes?.some((like: { user_id: string }) => like.user_id === userId) : false,
      tags: photo.photo_tags?.map((tag: { tag: string }) => tag.tag) || [],
      products_count: 0, // Will be implemented when product_tags table is created
      color_palette: [] // Will be extracted from image analysis later
    }));
  }
}