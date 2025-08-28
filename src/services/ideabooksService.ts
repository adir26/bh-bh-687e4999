import { supabase } from '@/integrations/supabase/client';
import { Ideabook, IdeabookPhoto } from '@/types/inspiration';

export class IdeabooksService {
  static async listByUser(userId: string): Promise<Ideabook[]> {
    const { data, error } = await supabase
      .from('ideabooks')
      .select(`
        id, name, is_public, share_token, owner_id, created_at, updated_at,
        ideabook_photos(id)
      `)
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(ideabook => ({
      ...ideabook,
      photos_count: ideabook.ideabook_photos?.length || 0
    }));
  }

  static async getById(id: string): Promise<Ideabook | null> {
    const { data, error } = await supabase
      .from('ideabooks')
      .select(`
        id, name, is_public, share_token, owner_id, created_at, updated_at,
        ideabook_photos(
          id, photo_id, added_by, created_at,
          photos(id, title, storage_path, room, style)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      photos_count: data.ideabook_photos?.length || 0
    };
  }

  static async create(payload: { name: string; is_public: boolean }): Promise<Ideabook> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ideabooks')
      .insert({
        name: payload.name,
        is_public: payload.is_public,
        owner_id: user.id,
        share_token: payload.is_public ? this.generateShareToken() : null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      photos_count: 0
    };
  }

  static async update(id: string, updates: Partial<Pick<Ideabook, 'name' | 'is_public'>>): Promise<void> {
    const { error } = await supabase
      .from('ideabooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideabooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async addPhoto(ideabookId: string, photoId: string, note?: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ideabook_photos')
      .insert({
        ideabook_id: ideabookId,
        photo_id: photoId,
        added_by: user.id,
        note
      });

    if (error) throw error;

    // Update ideabook's updated_at timestamp
    await this.update(ideabookId, {});
  }

  static async removePhoto(ideabookId: string, photoId: string): Promise<void> {
    const { error } = await supabase
      .from('ideabook_photos')
      .delete()
      .eq('ideabook_id', ideabookId)
      .eq('photo_id', photoId);

    if (error) throw error;

    // Update ideabook's updated_at timestamp
    await this.update(ideabookId, {});
  }

  static async getPhotos(ideabookId: string): Promise<IdeabookPhoto[]> {
    const { data, error } = await supabase
      .from('ideabook_photos')
      .select(`
        id, ideabook_id, photo_id, added_by, created_at,
        photos(id, title, storage_path, room, style)
      `)
      .eq('ideabook_id', ideabookId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  static async setCover(ideabookId: string, imageUrl: string): Promise<void> {
    const { error } = await supabase
      .from('ideabooks')
      .update({
        // Note: cover_image_url column doesn't exist in current schema
        // This will need to be added to the ideabooks table
        updated_at: new Date().toISOString()
      })
      .eq('id', ideabookId);

    if (error) throw error;
  }

  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}