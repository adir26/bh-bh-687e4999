import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DATE_RANGE_PRESETS, type DateRange, type DateRangePreset } from '@/types/kpi';
import { getDateRangeFromPreset } from '@/hooks/useAdminKpis';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [customFromOpen, setCustomFromOpen] = useState(false);
  const [customToOpen, setCustomToOpen] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const newRange = getDateRangeFromPreset(preset);
      onDateRangeChange(newRange);
    }
  };

  const handleCustomFromChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, from: date });
      setCustomFromOpen(false);
    }
  };

  const handleCustomToChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, to: date });
      setCustomToOpen(false);
    }
  };

  return (
    <Card className="mobile-card" dir="rtl">
      <CardContent className="mobile-padding">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Preset Selector */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">טווח תאריכים</label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_PRESETS.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {selectedPreset === 'custom' && (
            <>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">מתאריך</label>
                <Popover open={customFromOpen} onOpenChange={setCustomFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "PPP", { locale: he })
                      ) : (
                        <span>בחר תאריך</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={handleCustomFromChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2020-01-01")
                      }
                      initialFocus
                      locale={he}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">עד תאריך</label>
                <Popover open={customToOpen} onOpenChange={setCustomToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, "PPP", { locale: he })
                      ) : (
                        <span>בחר תאריך</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={handleCustomToChange}
                      disabled={(date) =>
                        date > new Date() || date < dateRange.from
                      }
                      initialFocus
                      locale={he}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <div className="flex items-end">
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin"
                )} />
                רענן נתונים
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};