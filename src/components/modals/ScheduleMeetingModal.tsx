import React, { useState } from 'react';
import { Calendar, Clock, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MeetingService, TimeSlot } from '@/services/meetingService';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  supplierName: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onOpenChange,
  supplierId,
  supplierName
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const queryClient = useQueryClient();

  // Fetch available time slots for the current week
  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ['available-slots', supplierId, currentWeek],
    queryFn: async () => {
      const slots = await MeetingService.getAvailableTimeSlots(
        supplierId,
        currentWeek,
        7 // One week
      );
      
      // Group slots by date
      const groupedSlots: Record<string, TimeSlot[]> = {};
      slots.forEach(slot => {
        if (!groupedSlots[slot.date]) {
          groupedSlots[slot.date] = [];
        }
        groupedSlots[slot.date].push(slot);
      });
      
      return groupedSlots;
    },
    enabled: isOpen
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error('No slot selected');
      
      const startsAt = new Date(`${selectedSlot.date}T${selectedSlot.start_time}`).toISOString();
      const endsAt = new Date(`${selectedSlot.date}T${selectedSlot.end_time}`).toISOString();
      
      return MeetingService.createBooking(supplierId, startsAt, endsAt, notes);
    },
    onSuccess: () => {
      toast({
        title: "בקשת פגישה נשלחה",
        description: "הספק יקבל הודעה ויחזור אליך בקרוב",
      });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      onOpenChange(false);
      setSelectedSlot(null);
      setNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשליחת בקשה",
        description: error.message || "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  });

  const handleBookMeeting = () => {
    if (!selectedSlot) return;
    createBookingMutation.mutate();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    if (direction === 'prev') {
      newWeek.setDate(newWeek.getDate() - 7);
    } else {
      newWeek.setDate(newWeek.getDate() + 7);
    }
    
    // Don't go to past weeks
    if (newWeek >= startOfWeek(new Date(), { weekStartsOn: 0 })) {
      setCurrentWeek(newWeek);
    }
  };

  const getDayName = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEEE', { locale: he });
  };

  const getDateFormatted = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd/MM', { locale: he });
  };

  // Generate dates for current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            קביעת פגישה עם {supplierName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              השבוע הבא
            </Button>
            
            <div className="text-center">
              <span className="font-medium">
                {format(currentWeek, 'dd/MM', { locale: he })} - {format(addDays(currentWeek, 6), 'dd/MM', { locale: he })}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              disabled={currentWeek <= startOfWeek(new Date(), { weekStartsOn: 0 })}
            >
              השבוע הקודם
            </Button>
          </div>

          {/* Available Time Slots */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground mt-2">טוען זמנים פנויים...</p>
              </div>
            ) : (
              <>
                {weekDates.map(date => {
                  const daySlots = timeSlots?.[date] || [];
                  const availableSlots = daySlots.filter(slot => slot.available);
                  
                  if (availableSlots.length === 0) return null;
                  
                  return (
                    <Card key={date} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-sm font-medium">
                          {getDayName(date)} {getDateFormatted(date)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {availableSlots.length} זמנים פנויים
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            size="sm"
                            className="text-sm"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {slot.start_time} - {slot.end_time}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
                
                {weekDates.every(date => !timeSlots?.[date]?.some(slot => slot.available)) && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">אין זמנים פנויים השבוע</h3>
                    <p className="text-sm text-muted-foreground">נסה לבחור שבוע אחר או צור קשר עם הספק</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selected Slot & Notes */}
          {selectedSlot && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4" />
                <span className="font-medium">פרטי הפגישה</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {getDayName(selectedSlot.date)} {getDateFormatted(selectedSlot.date)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    הערות לפגישה (אופציונלי)
                  </label>
                  <Textarea
                    placeholder="פרט על נושא הפגישה או דרישות מיוחדות..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBookMeeting}
              disabled={!selectedSlot || createBookingMutation.isPending}
              className="flex-1"
            >
              {createBookingMutation.isPending ? "שולח בקשה..." : "שלח בקשת פגישה"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBookingMutation.isPending}
            >
              <X className="w-4 h-4" />
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};