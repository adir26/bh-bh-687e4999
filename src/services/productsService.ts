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

export const productsService = {
  async listBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    const items = (data || []) as DBProduct[];

    // Create signed URLs for images
    const withSigned = await Promise.all(
      items.map(async (p) => {
        const images = p.images || [];
        const signed: string[] = [];
        for (const path of images) {
          const { data: signedData } = await supabase.storage
            .from("product-images")
            .createSignedUrl(path, 60 * 60);
          if (signedData?.signedUrl) signed.push(signedData.signedUrl);
        }
        return { ...p, imagesSigned: signed } as DBProduct & { imagesSigned: string[] };
      })
    );

    return withSigned;
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
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${supplierId}/${productId}/${fileName}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60);
    return { path, signedUrl: signed?.signedUrl };
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
