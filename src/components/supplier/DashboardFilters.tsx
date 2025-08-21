import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { DateRange, Granularity } from '@/hooks/useSupplierDashboard';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  granularity: Granularity;
  onGranularityChange: (granularity: Granularity) => void;
  customFrom?: Date;
  customTo?: Date;
  onCustomFromChange: (date: Date | undefined) => void;
  onCustomToChange: (date: Date | undefined) => void;
}

const dateRangeOptions = [
  { value: 'today' as const, label: 'היום' },
  { value: '7d' as const, label: '7 ימים' },
  { value: '30d' as const, label: '30 ימים' },
  { value: 'mtd' as const, label: 'החודש הנוכחי' },
  { value: 'qtd' as const, label: 'הרבעון הנוכחי' },
  { value: 'ytd' as const, label: 'השנה הנוכחית' },
  { value: 'custom' as const, label: 'תאריך מותאם' },
];

const granularityOptions = [
  { value: 'day' as const, label: 'יום' },
  { value: 'week' as const, label: 'שבוע' },
  { value: 'month' as const, label: 'חודש' },
];

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  granularity,
  onGranularityChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}) => {
  return (
    <Card className="mobile-card" dir="rtl">
      <CardContent className="mobile-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">טווח תאריכים</label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date From (only show if custom selected) */}
          {dateRange === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">מתאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !customFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customFrom ? (
                      format(customFrom, "PPP", { locale: he })
                    ) : (
                      <span>בחר תאריך</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customFrom}
                    onSelect={onCustomFromChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={he}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Custom Date To (only show if custom selected) */}
          {dateRange === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">עד תאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !customTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customTo ? (
                      format(customTo, "PPP", { locale: he })
                    ) : (
                      <span>בחר תאריך</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customTo}
                    onSelect={onCustomToChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={he}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Granularity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">רמת פירוט</label>
            <Select value={granularity} onValueChange={onGranularityChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {granularityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};