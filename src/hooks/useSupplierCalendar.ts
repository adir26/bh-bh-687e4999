import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

export interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface BookingWithProfile {
  id: string;
  supplier_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  meeting_type: string | null;
  location: string | null;
  created_at: string;
  client_name?: string;
  client_email?: string;
}

export function useSupplierAvailability(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['supplier-availability', supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('supplier_id', supplierId!)
        .order('day_of_week')
        .order('start_time');
      if (error) throw error;
      return (data || []) as AvailabilitySlot[];
    },
  });
}

export function useSupplierBookings(supplierId: string | undefined, month: Date) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  return useQuery({
    queryKey: ['supplier-bookings', supplierId, startOfMonth.toISOString()],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('supplier_id', supplierId!)
        .gte('starts_at', startOfMonth.toISOString())
        .lte('starts_at', endOfMonth.toISOString())
        .order('starts_at');
      if (error) throw error;

      // Enrich with client profiles
      const bookings = data || [];
      const clientIds = [...new Set(bookings.map(b => b.client_id))];
      
      let profiles: Record<string, { full_name: string | null; email: string }> = {};
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds);
        if (profilesData) {
          profiles = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }

      return bookings.map(b => ({
        ...b,
        client_name: profiles[b.client_id]?.full_name || 'לקוח',
        client_email: profiles[b.client_id]?.email || '',
      })) as BookingWithProfile[];
    },
  });
}

export function useSaveAvailability() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (slots: AvailabilitySlot[]) => {
      const supplierId = user!.id;
      // Delete existing
      await supabase.from('availability').delete().eq('supplier_id', supplierId);
      // Insert new
      if (slots.length > 0) {
        const { error } = await supabase.from('availability').insert(
          slots.map(s => ({
            supplier_id: supplierId,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            timezone: s.timezone || 'Asia/Jerusalem',
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-availability'] });
      showToast.success('הזמינות עודכנה בהצלחה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון הזמינות');
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status, notes }: { bookingId: string; status: 'confirmed' | 'rejected'; notes?: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status, notes: notes || undefined, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-bookings'] });
      showToast.success(status === 'confirmed' ? 'הפגישה אושרה' : 'הפגישה נדחתה');
    },
    onError: () => {
      showToast.error('שגיאה בעדכון סטטוס הפגישה');
    },
  });
}

export function useBookingsRealtime(supplierId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supplierId) return;

    const channel = supabase
      .channel('supplier-bookings-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `supplier_id=eq.${supplierId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-bookings'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supplierId, queryClient]);
}
