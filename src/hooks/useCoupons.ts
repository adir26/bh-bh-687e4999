import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Coupon {
  id: string;
  supplier_id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  coupon_code: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping' | 'gift';
  discount_value: number;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  is_featured: boolean;
  min_order_amount: number;
  created_at: string;
  updated_at: string;
  company_name?: string;
}

export type CouponInsert = Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'current_uses' | 'company_name'>;

export function useSupplierCoupons() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['supplier-coupons', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('supplier_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!user?.id,
  });
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['active-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*, companies(name)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        company_name: c.companies?.name || null,
        companies: undefined,
      })) as Coupon[];
    },
  });
}

export function useAllActiveCoupons() {
  return useQuery({
    queryKey: ['all-active-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*, companies(name)')
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        company_name: c.companies?.name || null,
        companies: undefined,
      })) as Coupon[];
    },
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (coupon: Partial<CouponInsert>) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, supplier_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-coupons'] });
      qc.invalidateQueries({ queryKey: ['active-coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-coupons'] });
      qc.invalidateQueries({ queryKey: ['active-coupons'] });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-coupons'] });
      qc.invalidateQueries({ queryKey: ['active-coupons'] });
    },
  });
}
