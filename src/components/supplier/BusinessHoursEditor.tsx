import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  [key: string]: DayHours;
}

interface BusinessHoursEditorProps {
  value: BusinessHours;
  onChange: (value: BusinessHours) => void;
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

const DEFAULT_HOURS: DayHours = {
  open: '09:00',
  close: '17:00',
  closed: false,
};

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const businessHours = value || {};

  const handleDayToggle = (day: string) => {
    const currentDay = businessHours[day] || DEFAULT_HOURS;
    onChange({
      ...businessHours,
      [day]: {
        ...currentDay,
        closed: !currentDay.closed,
      },
    });
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', time: string) => {
    const currentDay = businessHours[day] || DEFAULT_HOURS;
    onChange({
      ...businessHours,
      [day]: {
        ...currentDay,
        [field]: time,
      },
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Label className="text-base font-semibold">שעות פעילות</Label>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayHours = businessHours[key] || DEFAULT_HOURS;
            return (
              <div key={key} className="flex items-center gap-4 pb-3 border-b last:border-0">
                <div className="w-20 font-medium">{label}</div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!dayHours.closed}
                    onCheckedChange={() => handleDayToggle(key)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {dayHours.closed ? 'סגור' : 'פתוח'}
                  </span>
                </div>

                {!dayHours.closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
