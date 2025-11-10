import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInspectionItem, useUpdateInspectionItem } from '@/hooks/useInspectionItems';
import { useStandardsLibrary } from '@/hooks/useStandardsLibrary';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FindingFormSheetProps {
  reportId: string;
  item?: any;
  open: boolean;
  onClose: () => void;
}

const categories = [
  'קירות',
  'רצפה',
  'תקרה',
  'אינסטלציה',
  'חשמל',
  'דלתות וחלונות',
  'מערכות',
  'גימורים',
  'אחר',
];

export default function FindingFormSheet({ reportId, item, open, onClose }: FindingFormSheetProps) {
  const [formData, setFormData] = useState<{
    category: string;
    title: string;
    location: string;
    description: string;
    status_check: 'ok' | 'not_ok' | 'na';
    severity?: 'low' | 'medium' | 'high';
    standard_code: string;
    standard_clause: string;
    standard_quote: string;
  }>({
    category: '',
    title: '',
    location: '',
    description: '',
    status_check: 'na',
    severity: undefined,
    standard_code: '',
    standard_clause: '',
    standard_quote: '',
  });

  const [standardSearch, setStandardSearch] = useState('');
  const [standardOpen, setStandardOpen] = useState(false);

  const { data: standards = [] } = useStandardsLibrary(standardSearch);
  const createItem = useCreateInspectionItem();
  const updateItem = useUpdateInspectionItem();

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category || '',
        title: item.title || '',
        location: item.location || '',
        description: item.description || '',
        status_check: item.status_check || 'na',
        severity: item.severity || '',
        standard_code: item.standard_code || '',
        standard_clause: item.standard_clause || '',
        standard_quote: item.standard_quote || '',
      });
    } else {
      setFormData({
        category: '',
        title: '',
        location: '',
        description: '',
        status_check: 'na',
        severity: undefined,
        standard_code: '',
        standard_clause: '',
        standard_quote: '',
      });
    }
  }, [item, open]);

  const handleSubmit = () => {
    const data = { ...formData, report_id: reportId };

    if (item) {
      updateItem.mutate({ id: item.id, reportId, ...formData });
    } else {
      createItem.mutate(data);
    }
    onClose();
  };

  const handleStandardSelect = (standard: any) => {
    setFormData({
      ...formData,
      title: standard.title,
      description: standard.description || '',
      standard_code: standard.standard_code || '',
      standard_clause: standard.standard_clause || '',
      standard_quote: standard.standard_quote || '',
      severity: standard.default_severity || '',
      category: standard.category || formData.category,
    });
    setStandardOpen(false);
  };

  const isValid = formData.category && formData.title && (formData.status_check !== 'not_ok' || formData.severity);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? 'עריכת ממצא' : 'ממצא חדש'}</SheetTitle>
          <SheetDescription>הזן את פרטי הממצא</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Category */}
          <div>
            <Label>קטגוריה</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Standard Autocomplete */}
          <div>
            <Label>ממצא (חיפוש בתקנים)</Label>
            <Popover open={standardOpen} onOpenChange={setStandardOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {formData.title || 'חפש תקן או הזן ידנית'}
                  <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="חפש תקן..."
                    value={standardSearch}
                    onValueChange={setStandardSearch}
                  />
                  <CommandList>
                    <CommandEmpty>לא נמצאו תקנים</CommandEmpty>
                    <CommandGroup>
                      {standards.slice(0, 10).map((standard) => (
                        <CommandItem
                          key={standard.id}
                          onSelect={() => handleStandardSelect(standard)}
                        >
                          <Check
                            className={cn(
                              'ml-2 h-4 w-4',
                              formData.standard_code === standard.standard_code ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div>
                            <div className="font-medium">{standard.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {standard.standard_code} - {standard.category}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Title (manual input) */}
          <div>
            <Label>כותרת ממצא</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="הזן כותרת"
            />
          </div>

          {/* Location */}
          <div>
            <Label>מיקום</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="למשל: חדר שינה ראשי"
            />
          </div>

          {/* Status Check */}
          <div>
            <Label>סטטוס בדיקה</Label>
            <RadioGroup
              value={formData.status_check}
              onValueChange={(value: any) => setFormData({ ...formData, status_check: value })}
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="ok" id="ok" />
                <Label htmlFor="ok">תקין</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="not_ok" id="not_ok" />
                <Label htmlFor="not_ok">לא תקין</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="na" id="na" />
                <Label htmlFor="na">לא נבדק</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Severity (only if not_ok) */}
          {formData.status_check === 'not_ok' && (
            <div>
              <Label>חומרה *</Label>
              <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר חומרה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label>תיאור/הערות</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תיאור מפורט"
              rows={3}
            />
          </div>

          {/* Standard Details (read-only if populated) */}
          {formData.standard_code && (
            <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
              <p className="text-sm font-medium">פרטי תקן:</p>
              <p className="text-xs">
                <strong>קוד:</strong> {formData.standard_code}
              </p>
              {formData.standard_clause && (
                <p className="text-xs">
                  <strong>סעיף:</strong> {formData.standard_clause}
                </p>
              )}
              {formData.standard_quote && (
                <p className="text-xs italic">"{formData.standard_quote}"</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={!isValid} className="flex-1">
              {item ? 'עדכן' : 'שמור'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
