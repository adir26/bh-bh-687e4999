import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedCategory } from '@/types/admin';

interface CategoryFormData {
  name: string;
  description: string;
  parent_id: string | null;
  icon: string;
  is_active: boolean;
  is_public: boolean;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoryFormData;
  onFormDataChange: (data: CategoryFormData) => void;
  onSubmit: () => void;
  parentCategories: EnhancedCategory[];
  isLoading: boolean;
  mode: 'add' | 'edit';
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  parentCategories,
  isLoading,
  mode
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-hebrew">
        <DialogHeader>
          <DialogTitle className="text-right">
            {mode === 'add' ? 'הוספת קטגוריה חדשה' : 'עריכת קטגוריה'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div>
            <Label htmlFor="category-name" className="font-hebrew">שם הקטגוריה *</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="למשל: בניה ושיפוצים"
              className="text-right"
              dir="rtl"
            />
          </div>
          
          <div>
            <Label htmlFor="category-description" className="font-hebrew">תיאור</Label>
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="תיאור הקטגוריה..."
              className="text-right"
              dir="rtl"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="parent-category" className="font-hebrew">קטגוריית אב</Label>
            <Select 
              value={formData.parent_id || ""} 
              onValueChange={(value) => onFormDataChange({ ...formData, parent_id: value || null })}
            >
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="בחר קטגוריית אב (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא קטגוריית אב</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category-icon" className="font-hebrew">אייקון</Label>
            <Input
              id="category-icon"
              value={formData.icon}
              onChange={(e) => onFormDataChange({ ...formData, icon: e.target.value })}
              placeholder="שם האייקון (לדוגמה: Home)"
              className="text-right"
              dir="rtl"
            />
          </div>
          
          <div className="flex gap-4 justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-active"
                checked={formData.is_active}
                onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is-active" className="font-hebrew">פעיל</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-public"
                checked={formData.is_public}
                onChange={(e) => onFormDataChange({ ...formData, is_public: e.target.checked })}
              />
              <Label htmlFor="is-public" className="font-hebrew">ציבורי</Label>
            </div>
          </div>
          
          <Button 
            onClick={onSubmit}
            className="w-full font-hebrew"
            disabled={!formData.name.trim() || isLoading}
          >
            {isLoading ? 'שומר...' : mode === 'add' ? 'הוספת קטגוריה' : 'שמירת שינויים'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
