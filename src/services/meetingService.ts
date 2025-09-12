import { supabase } from '@/integrations/supabase/client';

export interface Availability {
  id: string;
  supplier_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  supplier_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  supplier?: {
    id: string;
    full_name?: string;
    email: string;
  };
  client?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

export class MeetingService {
  // Get supplier availability for a specific week
  static async getSupplierAvailability(supplierId: string): Promise<Availability[]> {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Set supplier availability
  static async setSupplierAvailability(
    supplierId: string,
    availability: Omit<Availability, 'id' | 'supplier_id' | 'created_at' | 'updated_at'>[]
  ): Promise<void> {
    // First, delete existing availability
    await supabase
      .from('availability')
      .delete()
      .eq('supplier_id', supplierId);

    // Then insert new availability
    if (availability.length > 0) {
      const { error } = await supabase
        .from('availability')
        .insert(
          availability.map(slot => ({
            ...slot,
            supplier_id: supplierId
          }))
        );

      if (error) throw error;
    }
  }

  // Generate available time slots for a supplier for the next 30 days
  static async getAvailableTimeSlots(
    supplierId: string,
    startDate: Date = new Date(),
    days: number = 30
  ): Promise<TimeSlot[]> {
    const availability = await this.getSupplierAvailability(supplierId);
    
    // Get existing bookings for the period
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('starts_at, ends_at')
      .eq('supplier_id', supplierId)
      .in('status', ['pending', 'confirmed'])
      .gte('starts_at', startDate.toISOString())
      .lt('starts_at', endDate.toISOString());

    const bookedSlots = new Set(
      (existingBookings || []).map(booking => 
        `${booking.starts_at}_${booking.ends_at}`
      )
    );

    const slots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find availability for this day of week
      const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
      
      for (const slot of dayAvailability) {
        // Generate 1-hour slots within the available period
        const startTime = new Date(`${dateStr}T${slot.start_time}`);
        const endTime = new Date(`${dateStr}T${slot.end_time}`);
        
        let currentSlotStart = new Date(startTime);
        
        while (currentSlotStart.getTime() + 60 * 60 * 1000 <= endTime.getTime()) {
          const currentSlotEnd = new Date(currentSlotStart.getTime() + 60 * 60 * 1000);
          
          const slotKey = `${currentSlotStart.toISOString()}_${currentSlotEnd.toISOString()}`;
          const isPastSlot = currentSlotStart.getTime() < Date.now();
          const isBooked = bookedSlots.has(slotKey);
          
          slots.push({
            date: dateStr,
            start_time: currentSlotStart.toTimeString().slice(0, 5),
            end_time: currentSlotEnd.toTimeString().slice(0, 5),
            available: !isPastSlot && !isBooked
          });
          
          // Move to next hour
          currentSlotStart = new Date(currentSlotEnd);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  // Create a booking request
  static async createBooking(
    supplierId: string,
    startsAt: string,
    endsAt: string,
    notes?: string
  ): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        supplier_id: supplierId,
        client_id: (await supabase.auth.getUser()).data.user!.id,
        starts_at: startsAt,
        ends_at: endsAt,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user's bookings
  static async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`supplier_id.eq.${userId},client_id.eq.${userId}`)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    
    // Fetch related profiles separately to avoid complex joins
    const bookings = data || [];
    const enrichedBookings: BookingWithDetails[] = [];
    
    for (const booking of bookings) {
      const { data: supplierProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', booking.supplier_id)
        .single();
        
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', booking.client_id)
        .single();
        
      enrichedBookings.push({
        ...booking,
        supplier: supplierProfile || undefined,
        client: clientProfile || undefined
      });
    }
    
    return enrichedBookings;
  }

  // Update booking status (for suppliers)
  static async updateBookingStatus(
    bookingId: string,
    status: 'confirmed' | 'rejected',
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status,
        notes: notes || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
  }

  // Cancel booking (for clients)
  static async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
  }

  // Check for conflicts before booking
  static async checkBookingConflict(
    supplierId: string,
    startsAt: string,
    endsAt: string
  ): Promise<boolean> {
    const { data } = await supabase.rpc('check_booking_conflict', {
      p_supplier_id: supplierId,
      p_starts_at: startsAt,
      p_ends_at: endsAt
    });

    return data === true;
  }

  // Validate booking against availability
  static async validateBookingAvailability(
    supplierId: string,
    startsAt: string,
    endsAt: string
  ): Promise<boolean> {
    const { data } = await supabase.rpc('validate_booking_availability', {
      p_supplier_id: supplierId,
      p_starts_at: startsAt,
      p_ends_at: endsAt
    });

    return data === true;
  }
}