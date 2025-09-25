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
  async listBySupplier(supplierId: string, page = 0, limit = PRODUCTS_PER_PAGE) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: 'exact' })
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    const items = (data || []) as DBProduct[];

    // Create signed URLs for images
    const withSigned = await Promise.all(
      items.map(async (p) => {
        const images = p.images || [];
        const signed: string[] = [];
        for (const path of images) {
          try {
            const { data: signedData } = await supabase.storage
              .from("product-images")
              .createSignedUrl(path, 60 * 60 * 24); // 24 hours
            if (signedData?.signedUrl) signed.push(signedData.signedUrl);
          } catch (e) {
            console.warn('Failed to create signed URL for:', path);
          }
        }
        return { ...p, imagesSigned: signed } as DBProduct & { imagesSigned: string[] };
      })
    );

    return {
      items: withSigned,
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
      .select("*", { count: 'exact' })
      .eq("supplier_id", supplierId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    const items = (data || []) as DBProduct[];

    // Create signed URLs for images
    const withSigned = await Promise.all(
      items.map(async (p) => {
        const images = p.images || [];
        const signed: string[] = [];
        for (const path of images) {
          try {
            const { data: signedData } = await supabase.storage
              .from("product-images")
              .createSignedUrl(path, 60 * 60 * 24);
            if (signedData?.signedUrl) signed.push(signedData.signedUrl);
          } catch (e) {
            console.warn('Failed to create signed URL for:', path);
          }
        }
        return { ...p, imagesSigned: signed } as DBProduct & { imagesSigned: string[] };
      })
    );

    return {
      items: withSigned,
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

  async uploadImage(file: File, supplierId: string, productId: string) {
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

    await trackEvent("product_image_uploaded", { 
      supplier_id: supplierId, 
      product_id: productId, 
      file_size: file.size,
      file_type: file.type 
    });

    const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24);
    return { path, signedUrl: signed?.signedUrl };
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
