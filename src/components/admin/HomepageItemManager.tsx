import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useHomepageItems, useCreateItem, useUpdateItem, useDeleteItem, useReorderItems, useHomepageImageUpload } from '@/hooks/useHomepageCMS';
import type { HomepageSection, HomepageItem, LinkType, CreateItemRequest, UpdateItemRequest } from '@/types/homepage';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface HomepageItemManagerProps {
  section: HomepageSection;
  open: boolean;
  onClose: () => void;
}

interface SortableItemProps {
  item: HomepageItem;
  onEdit: (item: HomepageItem) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-muted/50">
      <TableCell>
        <button
          className="cursor-grab hover:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="text-right">
        {item.image_url && (
          <img src={item.image_url} alt="" className="w-10 h-10 object-cover rounded ml-2" />
        )}
        <div>
          <div className="font-medium">{item.title_he || 'ללא כותרת'}</div>
          {item.subtitle_he && (
            <div className="text-sm text-muted-foreground">{item.subtitle_he}</div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">{item.order_index}</TableCell>
      <TableCell className="text-center">
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'פעיל' : 'לא פעיל'}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {item.link_type && (
          <Badge variant="outline">{getLinkTypeLabel(item.link_type)}</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function getLinkTypeLabel(type: LinkType): string {
  const labels = {
    url: 'קישור',
    category: 'קטגוריה',
    supplier: 'ספק',
    screen: 'מסך'
  };
  return labels[type] || type;
}

interface ItemEditorProps {
  item?: HomepageItem;
  sectionId: string;
  open: boolean;
  onClose: () => void;
}

function ItemEditor({ item, sectionId, open, onClose }: ItemEditorProps) {
  const isEditing = !!item;
  const [formData, setFormData] = useState<CreateItemRequest>({
    section_id: sectionId,
    title_he: item?.title_he || '',
    subtitle_he: item?.subtitle_he || '',
    image_url: item?.image_url || '',
    cta_label_he: item?.cta_label_he || '',
    link_type: item?.link_type || undefined,
    link_target_id: item?.link_target_id || '',
    link_url: item?.link_url || '',
    order_index: item?.order_index || 0,
    is_active: item?.is_active ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { uploadImage, uploading } = useHomepageImageUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload = { ...formData };

    // Upload image if selected
    if (imageFile) {
      try {
        const imageUrl = await uploadImage(imageFile);
        payload.image_url = imageUrl;
      } catch (error) {
        return; // Error already handled in hook
      }
    }

    if (isEditing) {
      await updateItem.mutateAsync({ 
        id: item.id, 
        section_id: sectionId, 
        ...payload 
      });
    } else {
      await createItem.mutateAsync(payload);
    }

    onClose();
  };

  const linkTypes = [
    { value: 'url', label: 'קישור URL' },
    { value: 'category', label: 'קטגוריה' },
    { value: 'supplier', label: 'ספק' },
    { value: 'screen', label: 'מסך באפליקציה' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? 'עריכת פריט' : 'פריט חדש'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title_he">כותרת</Label>
            <Input
              id="title_he"
              value={formData.title_he}
              onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))}
              placeholder="כותרת הפריט"
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="subtitle_he">תת-כותרת</Label>
            <Input
              id="subtitle_he"
              value={formData.subtitle_he}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle_he: e.target.value }))}
              placeholder="תת-כותרת"
              dir="rtl"
            />
          </div>

          <div>
            <Label>תמונה</Label>
            <div className="space-y-2">
              {formData.image_url && !imageFile && (
                <div className="relative">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  העלה תמונה
                </Label>
                {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="cta_label_he">תווית כפתור</Label>
            <Input
              id="cta_label_he"
              value={formData.cta_label_he}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_label_he: e.target.value }))}
              placeholder="לחץ כאן"
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="link_type">סוג קישור</Label>
            <Select 
              value={formData.link_type || ''} 
              onValueChange={(value: LinkType) => setFormData(prev => ({ ...prev, link_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג קישור" />
              </SelectTrigger>
              <SelectContent>
                {linkTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.link_type === 'url' && (
            <div>
              <Label htmlFor="link_url">כתובת URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
          )}

          {formData.link_type && formData.link_type !== 'url' && (
            <div>
              <Label htmlFor="link_target_id">מזהה יעד</Label>
              <Input
                id="link_target_id"
                value={formData.link_target_id}
                onChange={(e) => setFormData(prev => ({ ...prev, link_target_id: e.target.value }))}
                placeholder="מזהה הקטגוריה/ספק/מסך"
                dir="ltr"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">פעיל</Label>
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="submit" 
              disabled={createItem.isPending || updateItem.isPending || uploading}
            >
              {uploading ? 'מעלה...' : isEditing ? 'עדכן' : 'צור'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function HomepageItemManager({ section, open, onClose }: HomepageItemManagerProps) {
  const [editingItem, setEditingItem] = useState<HomepageItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSupplierSelector, setShowSupplierSelector] = useState(false);

  const { data: items = [] } = useHomepageItems(section.id);
  const deleteItem = useDeleteItem();
  const reorderItems = useReorderItems();

  // Check if this is a supplier_cards section
  const isSupplierSection = section.type === 'supplier_cards';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(items, oldIndex, newIndex);
      const itemIds = newOrder.map(item => item.id);
      
      reorderItems.mutate({ sectionId: section.id, itemIds });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
      await deleteItem.mutateAsync({ id, section_id: section.id });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>ניהול פריטים - {section.title_he || section.type}</span>
              <Button onClick={() => isSupplierSection ? setShowSupplierSelector(true) : setIsCreating(true)}>
                <Plus className="h-4 w-4 ml-2" />
                {isSupplierSection ? 'בחר ספקים' : 'פריט חדש'}
              </Button>
            </DialogTitle>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">פריטים ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  אין פריטים בקטע זה
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="text-right">תוכן</TableHead>
                        <TableHead className="text-center">סדר</TableHead>
                        <TableHead className="text-center">סטטוס</TableHead>
                        <TableHead className="text-center">קישור</TableHead>
                        <TableHead className="text-center">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            onEdit={setEditingItem}
                            onDelete={handleDelete}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {isSupplierSection ? (
        <SupplierSelector
          sectionId={section.id}
          open={showSupplierSelector}
          onClose={() => setShowSupplierSelector(false)}
          existingItems={items}
        />
      ) : (
        <ItemEditor
          item={editingItem || undefined}
          sectionId={section.id}
          open={isCreating || !!editingItem}
          onClose={() => {
            setIsCreating(false);
            setEditingItem(null);
          }}
        />
      )}

      {!isSupplierSection && editingItem && (
        <ItemEditor
          item={editingItem}
          sectionId={section.id}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}

interface SupplierSelectorProps {
  sectionId: string;
  open: boolean;
  onClose: () => void;
  existingItems: HomepageItem[];
}

function SupplierSelector({ sectionId, open, onClose, existingItems }: SupplierSelectorProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();

  // Fetch all approved suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['approved-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, tagline, logo_url, slug, featured, rating')
        .eq('status', 'approved')
        .eq('is_public', true)
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  // Initialize selected suppliers from existing items
  useEffect(() => {
    if (open && existingItems.length > 0) {
      const existingSupplierIds = new Set(
        existingItems
          .filter(item => item.link_type === 'supplier' && item.link_target_id)
          .map(item => item.link_target_id!)
      );
      setSelectedSuppliers(existingSupplierIds);
    }
  }, [open, existingItems]);

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => {
      const next = new Set(prev);
      if (next.has(supplierId)) {
        next.delete(supplierId);
      } else {
        next.add(supplierId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      // Get current supplier IDs
      const currentSupplierIds = new Set(
        existingItems
          .filter(item => item.link_type === 'supplier' && item.link_target_id)
          .map(item => item.link_target_id!)
      );

      // Remove deselected suppliers
      const toRemove = existingItems.filter(
        item => item.link_type === 'supplier' && 
                item.link_target_id && 
                !selectedSuppliers.has(item.link_target_id)
      );

      for (const item of toRemove) {
        await deleteItem.mutateAsync({ id: item.id, section_id: sectionId });
      }

      // Add newly selected suppliers
      const toAdd = Array.from(selectedSuppliers).filter(
        id => !currentSupplierIds.has(id)
      );

      let orderIndex = existingItems.length;
      for (const supplierId of toAdd) {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (!supplier) continue;

        await createItem.mutateAsync({
          section_id: sectionId,
          title_he: supplier.name,
          subtitle_he: supplier.tagline || '',
          image_url: supplier.logo_url || '',
          link_type: 'supplier',
          link_target_id: supplierId,
          order_index: orderIndex++,
          is_active: true
        });
      }

      toast({
        title: 'הצלחה',
        description: 'הספקים עודכנו בהצלחה'
      });
      onClose();
    } catch (error) {
      console.error('Error saving suppliers:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשמירת הספקים',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>בחר ספקים מובילים</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">טוען ספקים...</div>
        ) : (
          <div className="space-y-2">
            {suppliers.map(supplier => (
              <div
                key={supplier.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleSupplier(supplier.id)}
              >
                <Checkbox
                  checked={selectedSuppliers.has(supplier.id)}
                  onCheckedChange={() => toggleSupplier(supplier.id)}
                />
                {supplier.logo_url && (
                  <img
                    src={supplier.logo_url}
                    alt={supplier.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 text-right">
                  <div className="font-medium flex items-center gap-2">
                    {supplier.name}
                    {supplier.featured && (
                      <Badge variant="secondary" className="text-xs">מומלץ</Badge>
                    )}
                  </div>
                  {supplier.tagline && (
                    <div className="text-sm text-muted-foreground">{supplier.tagline}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button 
            onClick={handleSave}
            disabled={createItem.isPending || deleteItem.isPending}
          >
            שמור ({selectedSuppliers.size} ספקים)
          </Button>
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}