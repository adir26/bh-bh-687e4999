import { supabase } from "@/integrations/supabase/client";

export interface DBProduct {
  id: string;
  supplier_id: string;
  name: string;
  description?: string | null;
  price: number | null;
  currency: string;
  category_id?: string | null;
  images?: string[] | null; // storage paths like supplierId/productId/filename
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type NewProduct = Omit<DBProduct, "id" | "created_at" | "updated_at" | "is_published" | "images"> & {
  images?: File[];
};

export type UpdateProduct = Partial<Omit<DBProduct, "id" | "supplier_id" | "created_at" | "updated_at">> & {
  images?: File[]; // new images to append
};

// File validation constants
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Pagination constants
export const PRODUCTS_PER_PAGE = 20;

async function trackEvent(metric: string, labels: Record<string, any> = {}) {
  try {
    await supabase.rpc("log_performance_metric", {
      p_metric_name: metric,
      p_metric_value: 1,
      p_labels: labels,
    });
  } catch (e) {
    console.warn("trackEvent failed", e);
  }
}

// Validation functions
export const validateImageFile = (file: File): string | null => {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return `סוג קובץ לא נתמך. אנא בחר קובץ תמונה (JPG, PNG, WebP)`;
  }
  if (file.size > IMAGE_MAX_SIZE) {
    return `הקובץ גדול מדי. גודל מקסימלי: ${IMAGE_MAX_SIZE / 1024 / 1024}MB`;
  }
  return null;
};

export const validateImageFiles = (files: File[]): string[] => {
  const errors: string[] = [];
  files.forEach((file, index) => {
    const error = validateImageFile(file);
    if (error) {
      errors.push(`קובץ ${index + 1}: ${error}`);
    }
  });
  return errors;
};

export const productsService = {
  // ✅ NEW: Add image to product_images table
  async attachProductImage(
    productId: string, 
    supplierId: string,
    storagePath: string, 
    isPrimary: boolean = false
  ) {
    // If primary, demote all others first
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: storagePath,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) throw error;

    // Compute public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return { ...data, public_url: urlData.publicUrl };
  },

  // ✅ NEW: Get images for a product
  async getProductImages(productId: string) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Add public URLs
    return (data || []).map(img => ({
      ...img,
      public_url: supabase.storage
        .from('product-images')
        .getPublicUrl(img.storage_path).data.publicUrl
    }));
  },

  // ✅ NEW: Delete image from both storage and DB
  async deleteProductImage(imageId: string, supplierId: string) {
    // Get image record
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('storage_path, product:products!inner(supplier_id)')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;
    if ((image.product as any).supplier_id !== supplierId) {
      throw new Error('Unauthorized');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([image.storage_path]);

    if (storageError) console.warn('Storage delete failed:', storageError);

    // Delete from DB
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;
  },

  async listBySupplier(supplierId: string, page = 0, limit = PRODUCTS_PER_PAGE) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select(`
        *,
        product_images(
          id,
          storage_path,
          is_primary,
          sort_order
        )
      `, { count: 'exact' })
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Process images from product_images table
    const items = (data || []).map(product => {
      const productImages = (product.product_images || []) as any[];
      const images = productImages
        .sort((a, b) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return a.sort_order - b.sort_order;
        })
        .map(img => ({
          ...img,
          public_url: supabase.storage
            .from('product-images')
            .getPublicUrl(img.storage_path).data.publicUrl
        }));

      return {
        ...product,
        imageUrls: images.map(i => i.public_url),
        primaryImage: images.find(i => i.is_primary)?.public_url || images[0]?.public_url,
        productImages: images
      };
    });

    return {
      items,
      totalCount: count || 0,
      hasNextPage: count ? (from + limit) < count : false,
      hasPrevPage: page > 0
    };
  },

  async searchProducts(supplierId: string, query: string, page = 0, limit = PRODUCTS_PER_PAGE) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select(`
        *,
        product_images(
          id,
          storage_path,
          is_primary,
          sort_order
        )
      `, { count: 'exact' })
      .eq("supplier_id", supplierId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Process images from product_images table
    const items = (data || []).map(product => {
      const productImages = (product.product_images || []) as any[];
      const images = productImages
        .sort((a, b) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return a.sort_order - b.sort_order;
        })
        .map(img => ({
          ...img,
          public_url: supabase.storage
            .from('product-images')
            .getPublicUrl(img.storage_path).data.publicUrl
        }));

      return {
        ...product,
        imageUrls: images.map(i => i.public_url),
        primaryImage: images.find(i => i.is_primary)?.public_url || images[0]?.public_url,
        productImages: images
      };
    });

    return {
      items,
      totalCount: count || 0,
      hasNextPage: count ? (from + limit) < count : false,
      hasPrevPage: page > 0
    };
  },

  async create(supplierId: string, input: { name: string; description?: string; price?: number; currency?: string; category_id?: string | null; }) {
    const payload: Partial<DBProduct> = {
      supplier_id: supplierId,
      name: input.name,
      description: input.description ?? null,
      price: input.price ?? null,
      currency: input.currency ?? "ILS",
      category_id: input.category_id ?? null,
      is_published: false,
      images: [],
    };

    const { data, error } = await supabase
      .from("products")
      .insert(payload as any)
      .select()
      .maybeSingle();

    if (error) throw error;
    await trackEvent("product_created", { supplier_id: supplierId, product_id: data.id });
    return data as DBProduct;
  },

  async update(productId: string, patch: UpdateProduct) {
    const { images, ...rest } = patch;

    const { data, error } = await supabase
      .from("products")
      .update(rest as any)
      .eq("id", productId)
      .select()
      .maybeSingle();

    if (error) throw error;
    await trackEvent("product_updated", { product_id: productId });
    return data as DBProduct;
  },

  async remove(productId: string) {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
    await trackEvent("product_deleted", { product_id: productId });
  },

  async uploadImage(file: File, supplierId: string, productId: string, isPrimary: boolean = false) {
    // Validate file before upload
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const path = `${supplierId}/${productId}/${fileName}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    // ✅ NEW: Add to product_images table
    const imageRecord = await this.attachProductImage(
      productId, 
      supplierId, 
      path, 
      isPrimary
    );

    await trackEvent("product_image_uploaded", { 
      supplier_id: supplierId, 
      product_id: productId, 
      file_size: file.size,
      file_type: file.type 
    });

    return imageRecord;
  },

  async deleteImage(imagePath: string, supplierId: string, productId: string) {
    const { error } = await supabase.storage
      .from("product-images")
      .remove([imagePath]);
    
    if (error) throw error;
    
    await trackEvent("product_image_deleted", { 
      supplier_id: supplierId, 
      product_id: productId,
      image_path: imagePath
    });
  },

  async getProductStats(supplierId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("id, is_published")
      .eq("supplier_id", supplierId);

    if (error) throw error;

    const total = data?.length || 0;
    const published = data?.filter(p => p.is_published).length || 0;
    const hidden = total - published;

    return {
      total,
      published,
      hidden
    };
  },

  async togglePublish(productId: string, isPublished: boolean, supplierId?: string) {
    const { data, error } = await supabase
      .from("products")
      .update({ is_published: isPublished })
      .eq("id", productId)
      .select()
      .maybeSingle();
    if (error) throw error;
    await trackEvent(isPublished ? "product_published" : "product_unpublished", {
      product_id: productId,
      supplier_id: supplierId,
    });
    return data as DBProduct;
  },
};
