import React, { useState, useMemo } from 'react';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierHeader } from '@/components/SupplierHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  useSupplierAvailability,
  useSupplierBookings,
  useSaveAvailability,
  useUpdateBookingStatus,
  useBookingsRealtime,
  AvailabilitySlot,
  BookingWithProfile,
} from '@/hooks/useSupplierCalendar';
import {
  CalendarDays, Clock, Check, X, MapPin, User, Plus, Trash2, Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

const statusLabels: Record<string, string> = {
  pending: 'ממתינה',
  confirmed: 'מאושרת',
  rejected: 'נדחתה',
  cancelled: 'בוטלה',
};

export default function SupplierCalendar() {
  const { user } = useAuth();
  const supplierId = user?.id;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: availability = [], isLoading: loadingAvail } = useSupplierAvailability(supplierId);
  const { data: bookings = [], isLoading: loadingBookings } = useSupplierBookings(supplierId, currentMonth);
  const saveAvailability = useSaveAvailability();
  const updateStatus = useUpdateBookingStatus();
  useBookingsRealtime(supplierId);

  // Local availability editing state
  const [editSlots, setEditSlots] = useState<AvailabilitySlot[] | null>(null);
  const slots = editSlots ?? availability;

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingWithProfile[]> = {};
    bookings.forEach(b => {
      const dateKey = b.starts_at.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayBookings = bookingsByDate[selectedDateStr] || [];
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  // Calendar modifiers for dots
  const datesWithBookings = useMemo(() => {
    return Object.keys(bookingsByDate).map(d => new Date(d + 'T00:00:00'));
  }, [bookingsByDate]);

  const datesWithPending = useMemo(() => {
    return Object.entries(bookingsByDate)
      .filter(([, bs]) => bs.some(b => b.status === 'pending'))
      .map(([d]) => new Date(d + 'T00:00:00'));
  }, [bookingsByDate]);

  // Availability editing
  const addSlot = (dayOfWeek: number) => {
    const current = editSlots ?? [...availability];
    setEditSlots([...current, { day_of_week: dayOfWeek, start_time: '09:00', end_time: '17:00', timezone: 'Asia/Jerusalem' }]);
  };

  const removeSlot = (index: number) => {
    const current = editSlots ?? [...availability];
    setEditSlots(current.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const current = editSlots ?? [...availability];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setEditSlots(updated);
  };

  const handleSaveAvailability = () => {
    if (editSlots) {
      saveAvailability.mutate(editSlots, { onSuccess: () => setEditSlots(null) });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SupplierHeader title="לוח פגישות" subtitle="ניהול זמינות ופגישות" />
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {pendingCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">{pendingCount}</Badge>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">פגישות ממתינות לאישור</span>
          </div>
        )}

        <Tabs defaultValue="calendar" dir="rtl">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="calendar" className="gap-1"><CalendarDays className="h-4 w-4" />לוח שנה</TabsTrigger>
            <TabsTrigger value="availability" className="gap-1"><Clock className="h-4 w-4" />זמינות</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-2">
                  <CalendarUI
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    onMonthChange={setCurrentMonth}
                    locale={he}
                    className="pointer-events-auto"
                    modifiers={{
                      hasBooking: datesWithBookings,
                      hasPending: datesWithPending,
                    }}
                    modifiersStyles={{
                      hasBooking: { fontWeight: 'bold', textDecoration: 'underline' },
                      hasPending: { backgroundColor: 'hsl(var(--chart-4) / 0.2)' },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Day view */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {format(selectedDate, 'EEEE, d בMMMM yyyy', { locale: he })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="text-center py-8 text-muted-foreground">טוען...</div>
                  ) : dayBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">אין פגישות ביום זה</div>
                  ) : (
                    <div className="space-y-3">
                      {dayBookings.map(booking => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onConfirm={() => updateStatus.mutate({ bookingId: booking.id, status: 'confirmed' })}
                          onReject={() => updateStatus.mutate({ bookingId: booking.id, status: 'rejected' })}
                          isUpdating={updateStatus.isPending}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">שעות זמינות</CardTitle>
                {editSlots && (
                  <Button size="sm" onClick={handleSaveAvailability} disabled={saveAvailability.isPending}>
                    <Save className="h-4 w-4 ml-1" />
                    שמור
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loadingAvail ? (
                  <div className="text-center py-8 text-muted-foreground">טוען...</div>
                ) : (
                  <div className="space-y-4">
                    {[0, 1, 2, 3, 4, 5, 6].map(day => {
                      const daySlots = slots.filter(s => s.day_of_week === day);
                      return (
                        <div key={day} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-medium">{DAY_NAMES[day]}</Label>
                            <Button variant="ghost" size="sm" onClick={() => addSlot(day)}>
                              <Plus className="h-4 w-4 ml-1" />הוסף
                            </Button>
                          </div>
                          {daySlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">לא זמין</p>
                          ) : (
                            <div className="space-y-2">
                              {daySlots.map((slot, idx) => {
                                const globalIdx = slots.indexOf(slot);
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Select value={slot.start_time} onValueChange={v => updateSlot(globalIdx, 'start_time', v)}>
                                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                      <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <span className="text-muted-foreground">—</span>
                                    <Select value={slot.end_time} onValueChange={v => updateSlot(globalIdx, 'end_time', v)}>
                                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                      <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" onClick={() => removeSlot(globalIdx)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onConfirm,
  onReject,
  isUpdating,
}: {
  booking: BookingWithProfile;
  onConfirm: () => void;
  onReject: () => void;
  isUpdating: boolean;
}) {
  const startTime = format(new Date(booking.starts_at), 'HH:mm');
  const endTime = format(new Date(booking.ends_at), 'HH:mm');

  return (
    <div className={cn('border rounded-lg p-3 space-y-2', statusColors[booking.status] || '')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{startTime} - {endTime}</span>
          <Badge variant="outline" className="text-xs">{statusLabels[booking.status] || booking.status}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-3 w-3" />
        <span>{booking.client_name}</span>
      </div>
      {booking.location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3" />
          <span>{booking.location}</span>
        </div>
      )}
      {booking.notes && <p className="text-sm text-muted-foreground">{booking.notes}</p>}
      {booking.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={onConfirm} disabled={isUpdating} className="gap-1">
            <Check className="h-3 w-3" />אשר
          </Button>
          <Button size="sm" variant="outline" onClick={onReject} disabled={isUpdating} className="gap-1">
            <X className="h-3 w-3" />דחה
          </Button>
        </div>
      )}
    </div>
  );
}
