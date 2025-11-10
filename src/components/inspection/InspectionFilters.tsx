import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { X, Search } from 'lucide-react';
import { InspectionReportFilters } from '@/hooks/useInspectionReports';

interface InspectionFiltersProps {
  filters: InspectionReportFilters;
  onFiltersChange: (filters: InspectionReportFilters) => void;
}

const statusOptions = [
  { value: 'draft', label: 'טיוטה' },
  { value: 'in_progress', label: 'בתהליך' },
  { value: 'final', label: 'סופי' },
  { value: 'sent', label: 'נשלח' },
];

const reportTypeOptions = [
  { value: 'home_inspection', label: 'בדק בית' },
  { value: 'plumbing', label: 'אינסטלציה' },
  { value: 'supervision', label: 'פיקוח' },
  { value: 'leak_detection', label: 'איתור נזילות' },
  { value: 'qa', label: 'בקרת איכות' },
  { value: 'safety', label: 'בטיחות' },
  { value: 'consultants', label: 'יועצים' },
  { value: 'handover', label: 'מסירה' },
  { value: 'common_areas', label: 'שטחים משותפים' },
];

export function InspectionFilters({ filters, onFiltersChange }: InspectionFiltersProps) {
  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = filters.status || [];
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter((s) => s !== status);
    
    onFiltersChange({ ...filters, status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    (filters.status && filters.status.length > 0) ||
    filters.report_type ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">חיפוש</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="חפש לפי מספר דוח, פרויקט, הערות..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
                className="pr-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Multi-Select */}
            <div>
              <Label>סטטוס</Label>
              <div className="space-y-2 mt-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status?.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`status-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Type */}
            <div>
              <Label htmlFor="report-type">סוג דוח</Label>
              <Select
                value={filters.report_type || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, report_type: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="כל הסוגים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסוגים</SelectItem>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Label htmlFor="date-from">מתאריך</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
                }
              />
            </div>

            {/* Date To */}
            <div>
              <Label htmlFor="date-to">עד תאריך</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
                }
              />
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                אפס פילטרים
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}