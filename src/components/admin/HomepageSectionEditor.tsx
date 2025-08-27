import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Save, Copy, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateSection, useUpdateSection, useDuplicateSection } from '@/hooks/useHomepageCMS';
import type { HomepageSection, SectionType, Platform, SectionStatus } from '@/types/homepage';

interface HomepageSectionEditorProps {
  section?: HomepageSection;
  open: boolean;
  onClose: () => void;
}

export function HomepageSectionEditor({ section, open, onClose }: HomepageSectionEditorProps) {
  const isEditing = !!section;
  const [formData, setFormData] = useState({
    key: section?.key || '',
    type: section?.type || 'banner' as SectionType,
    title_he: section?.title_he || '',
    description_he: section?.description_he || '',
    priority: section?.priority || 100,
    is_active: section?.is_active ?? true,
    start_at: section?.start_at ? new Date(section.start_at) : undefined,
    end_at: section?.end_at ? new Date(section.end_at) : undefined,
    platform: section?.platform || 'web' as Platform,
    audience_json: section?.audience_json || {},
    status: section?.status || 'draft' as SectionStatus
  });

  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const duplicateSection = useDuplicateSection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      start_at: formData.start_at?.toISOString(),
      end_at: formData.end_at?.toISOString(),
    };

    if (isEditing) {
      await updateSection.mutateAsync({ id: section.id, ...payload });
    } else {
      await createSection.mutateAsync(payload);
    }

    onClose();
  };

  const handleDuplicate = async () => {
    if (section) {
      await duplicateSection.mutateAsync(section.id);
      onClose();
    }
  };

  const handlePublish = async () => {
    if (section) {
      await updateSection.mutateAsync({ 
        id: section.id, 
        status: section.status === 'published' ? 'draft' : 'published' 
      });
    }
  };

  const sectionTypes = [
    { value: 'banner', label: 'באנר' },
    { value: 'category_carousel', label: 'קרוסל קטגוריות' },
    { value: 'supplier_cards', label: 'כרטיסי ספקים' },
    { value: 'tabs', label: 'טאבים' }
  ];

  const platforms = [
    { value: 'web', label: 'ווב' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? 'עריכת קטע' : 'קטע חדש'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title_he">כותרת</Label>
              <Input
                id="title_he"
                value={formData.title_he}
                onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))}
                placeholder="כותרת הקטע"
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="key">מפתח ייחודי</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="hero_banner"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description_he">תיאור</Label>
            <Textarea
              id="description_he"
              value={formData.description_he}
              onChange={(e) => setFormData(prev => ({ ...prev, description_he: e.target.value }))}
              placeholder="תיאור הקטע"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">סוג</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: SectionType) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform">פלטפורמה</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value: Platform) => setFormData(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר פלטפורמה" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">קדימות</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                min="0"
                max="1000"
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">פעיל</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך התחלה</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !formData.start_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_at ? format(formData.start_at, "PPP") : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_at}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_at: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>תאריך סיום</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !formData.end_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_at ? format(formData.end_at, "PPP") : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_at}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_at: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Badge variant={section.status === 'published' ? 'default' : 'secondary'}>
                {section.status === 'published' ? 'פורסם' : 'טיוטה'}
              </Badge>
              <Badge variant={section.is_active ? 'default' : 'secondary'}>
                {section.is_active ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button type="submit" disabled={createSection.isPending || updateSection.isPending}>
                <Save className="h-4 w-4 ml-2" />
                {isEditing ? 'עדכן' : 'צור'}
              </Button>

              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePublish}
                    disabled={updateSection.isPending}
                  >
                    {section.status === 'published' ? (
                      <><EyeOff className="h-4 w-4 ml-2" />בטל פרסום</>
                    ) : (
                      <><Eye className="h-4 w-4 ml-2" />פרסם</>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDuplicate}
                    disabled={duplicateSection.isPending}
                  >
                    <Copy className="h-4 w-4 ml-2" />
                    שכפל
                  </Button>
                </>
              )}
            </div>

            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}