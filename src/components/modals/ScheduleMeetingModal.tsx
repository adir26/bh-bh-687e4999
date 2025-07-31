import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  supplierName
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      
      // Skip weekends for business meetings
      if (slotDate.getDay() !== 0 && slotDate.getDay() !== 6) {
        const dateStr = slotDate.toISOString().split('T')[0];
        const dayName = slotDate.toLocaleDateString('he-IL', { weekday: 'long' });
        const displayDate = slotDate.toLocaleDateString('he-IL');
        
        slots.push({
          value: dateStr,
          label: `${dayName}, ${displayDate}`
        });
      }
    }
    return slots;
  };

  const timeSlots = [
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' },
    { value: '14:00', label: '14:00' },
    { value: '15:00', label: '15:00' },
    { value: '16:00', label: '16:00' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast.error('יש להתחבר כדי לקבוע פגישה');
      return;
    }

    if (!date || !time) {
      showToast.error('נא לבחור תאריך ושעה');
      return;
    }

    setIsLoading(true);
    try {
      const datetime = new Date(`${date}T${time}:00`);
      
      const { error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          supplier_id: supplierId,
          datetime: datetime.toISOString(),
          status: 'pending',
          notes: notes || null
        });

      if (error) throw error;

      showToast.success('בקשת הפגישה נשלחה בהצלחה');
      setDate('');
      setTime('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      showToast.error('שגיאה בקביעת הפגישה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            קביעת פגישה עם {supplierName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">תאריך *</Label>
            <select
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">בחר תאריך</option>
              {generateTimeSlots().map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">שעה *</Label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">בחר שעה</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="פרטים נוספים לגבי הפגישה..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'שולח בקשה...' : 'שלח בקשת פגישה'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};