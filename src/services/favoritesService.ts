import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'supplier' | 'product' | 'inspiration' | 'ideabook';

export interface FavoriteItem {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  created_at: string;
}

export interface GroupedFavorites {
  suppliers: FavoriteSupplier[];
  products: FavoriteProduct[];
  inspirations: FavoriteInspiration[];
  ideabooks: FavoriteIdeabook[];
}

export interface FavoriteSupplier extends FavoriteItem {
  supplier_data?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface FavoriteProduct extends FavoriteItem {
  product_data?: {
    id: string;
    name: string;
    price?: number;
    currency: string;
    supplier_id: string;
  };
}

export interface FavoriteInspiration extends FavoriteItem {
  photo_data?: {
    id: string;
    title: string;
    storage_path: string;
    room?: string;
    style?: string;
  };
}

export interface FavoriteIdeabook extends FavoriteItem {
  ideabook_data?: {
    id: string;
    name: string;
    is_public: boolean;
    owner_id: string;
    photos_count?: number;
  };
}

export class FavoritesService {
  static async toggle(entityType: EntityType, entityId: string): Promise<boolean> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return false; // Removed
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId
        });

      if (error) throw error;
      return true; // Added
    }
  }

  static async isFavorited(entityType: EntityType, entityId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;

    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    return !!data;
  }

  static async listByUser(userId: string): Promise<GroupedFavorites> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const grouped: GroupedFavorites = {
      suppliers: [],
      products: [],
      inspirations: [],
      ideabooks: []
    };

    const favorites = data || [];

    // Group by entity type
    for (const favorite of favorites) {
      switch (favorite.entity_type) {
        case 'supplier':
          grouped.suppliers.push(favorite as FavoriteSupplier);
          break;
        case 'product':
          grouped.products.push(favorite as FavoriteProduct);
          break;
        case 'inspiration':
          grouped.inspirations.push(favorite as FavoriteInspiration);
          break;
        case 'ideabook':
          grouped.ideabooks.push(favorite as FavoriteIdeabook);
          break;
      }
    }

    // Fetch related data for each group
    await this.enrichSupplierData(grouped.suppliers);
    await this.enrichProductData(grouped.products);
    await this.enrichInspirationData(grouped.inspirations);
    await this.enrichIdeabookData(grouped.ideabooks);

    return grouped;
  }

  private static async enrichSupplierData(suppliers: FavoriteSupplier[]): Promise<void> {
    if (suppliers.length === 0) return;

    const supplierIds = suppliers.map(s => s.entity_id);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', supplierIds);

    if (data) {
      suppliers.forEach(supplier => {
        supplier.supplier_data = data.find(p => p.id === supplier.entity_id);
      });
    }
  }

  private static async enrichProductData(products: FavoriteProduct[]): Promise<void> {
    if (products.length === 0) return;

    const productIds = products.map(p => p.entity_id);
    const { data } = await supabase
      .from('products')
      .select('id, name, price, currency, supplier_id')
      .in('id', productIds);

    if (data) {
      products.forEach(product => {
        product.product_data = data.find(p => p.id === product.entity_id);
      });
    }
  }

  private static async enrichInspirationData(inspirations: FavoriteInspiration[]): Promise<void> {
    if (inspirations.length === 0) return;

    const photoIds = inspirations.map(i => i.entity_id);
    const { data } = await supabase
      .from('photos')
      .select('id, title, storage_path, room, style')
      .in('id', photoIds);

    if (data) {
      inspirations.forEach(inspiration => {
        inspiration.photo_data = data.find(p => p.id === inspiration.entity_id);
      });
    }
  }

  private static async enrichIdeabookData(ideabooks: FavoriteIdeabook[]): Promise<void> {
    if (ideabooks.length === 0) return;

    const ideabookIds = ideabooks.map(i => i.entity_id);
    const { data } = await supabase
      .from('ideabooks')
      .select(`
        id, name, is_public, owner_id,
        ideabook_photos(id)
      `)
      .in('id', ideabookIds);

    if (data) {
      ideabooks.forEach(ideabook => {
        const ideabookData = data.find(i => i.id === ideabook.entity_id);
        if (ideabookData) {
          ideabook.ideabook_data = {
            ...ideabookData,
            photos_count: ideabookData.ideabook_photos?.length || 0
          };
        }
      });
    }
  }

  static async getCountsByType(userId: string): Promise<Record<EntityType, number>> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('entity_type')
      .eq('user_id', userId);

    if (error) throw error;

    const counts: Record<EntityType, number> = {
      supplier: 0,
      product: 0,
      inspiration: 0,
      ideabook: 0
    };

    if (data) {
      data.forEach(favorite => {
        counts[favorite.entity_type as EntityType]++;
      });
    }

    return counts;
  }
}