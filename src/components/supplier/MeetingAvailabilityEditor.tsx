import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface MeetingAvailability {
  available_days: string[];
  hours: {
    start: string;
    end: string;
  };
  notes: string;
}

interface MeetingAvailabilityEditorProps {
  value: MeetingAvailability;
  onChange: (value: MeetingAvailability) => void;
}

const DAYS = [
  { key: 'sunday', label: 'ראשון' },
  { key: 'monday', label: 'שני' },
  { key: 'tuesday', label: 'שלישי' },
  { key: 'wednesday', label: 'רביעי' },
  { key: 'thursday', label: 'חמישי' },
  { key: 'friday', label: 'שישי' },
  { key: 'saturday', label: 'שבת' },
];

export function MeetingAvailabilityEditor({ value, onChange }: MeetingAvailabilityEditorProps) {
  const availability = value || {
    available_days: [],
    hours: { start: '09:00', end: '17:00' },
    notes: '',
  };

  const handleDayToggle = (day: string) => {
    const newDays = availability.available_days.includes(day)
      ? availability.available_days.filter((d) => d !== day)
      : [...availability.available_days, day];
    
    onChange({
      ...availability,
      available_days: newDays,
    });
  };

  const handleTimeChange = (field: 'start' | 'end', time: string) => {
    onChange({
      ...availability,
      hours: {
        ...availability.hours,
        [field]: time,
      },
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange({
      ...availability,
      notes,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Label className="text-base font-semibold">זמינות לפגישות</Label>
        
        <div>
          <Label className="text-sm mb-2 block">ימים זמינים</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`meeting-${key}`}
                  checked={availability.available_days.includes(key)}
                  onCheckedChange={() => handleDayToggle(key)}
                />
                <label
                  htmlFor={`meeting-${key}`}
                  className="text-sm cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">שעות מועדפות</Label>
          <div className="flex items-center gap-3">
            <Input
              type="time"
              value={availability.hours.start}
              onChange={(e) => handleTimeChange('start', e.target.value)}
              className="w-32"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="time"
              value={availability.hours.end}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              className="w-32"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="meeting-notes" className="text-sm mb-2 block">
            הערות והנחיות
          </Label>
          <Textarea
            id="meeting-notes"
            value={availability.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder='לדוגמה: "יש לתאם פגישה מראש", "פגישות בימי חמישי רק בבוקר"'
            rows={3}
          />
        </div>
      </div>
    </Card>
  );
}
