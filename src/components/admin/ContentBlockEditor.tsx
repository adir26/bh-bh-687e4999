import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { homepageContentService, companiesService, categoriesService, storageService, type HomepageContent, type Company, type Category } from "@/services/supabaseService";
import { Calendar, Upload, X, Plus, Trash2, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { withTimeout } from '@/lib/withTimeout';

interface ContentBlockEditorProps {
  block: HomepageContent;
  onSave: (block: HomepageContent) => void;
  onClose: () => void;
}

export function ContentBlockEditor({ block, onSave, onClose }: ContentBlockEditorProps) {
  const [editedBlock, setEditedBlock] = useState<HomepageContent>(JSON.parse(JSON.stringify(block)));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Load suppliers data with React Query
  const { data: suppliers = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async ({ signal }) => {
      return await withTimeout(companiesService.getAll(), 12000);
    },
    retry: 1,
    staleTime: 300_000, // 5 minutes
  });

  // Load categories data with React Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async ({ signal }) => {
      return await withTimeout(categoriesService.getAll(), 12000);
    },
    retry: 1,
    staleTime: 300_000, // 5 minutes
  });

  const updateContentData = (updates: any) => {
    setEditedBlock(prev => ({
      ...prev,
      content_data: { ...prev.content_data, ...updates }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedBlock = await withTimeout(
        homepageContentService.update(editedBlock.id, editedBlock),
        12000
      );
      onSave(updatedBlock);
      toast({
        title: "Success",
        description: "Content block saved successfully",
      });
    } catch (error) {
      console.error('Error saving block:', error);
      toast({
        title: "Error", 
        description: "Failed to save content block",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await storageService.uploadMarketingBanner(file);
      updateContentData({ image_url: imageUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addSupplier = (supplierId: string) => {
    const currentIds = editedBlock.content_data.supplier_ids || [];
    if (!currentIds.includes(supplierId)) {
      updateContentData({ supplier_ids: [...currentIds, supplierId] });
    }
  };

  const removeSupplier = (supplierId: string) => {
    const currentIds = editedBlock.content_data.supplier_ids || [];
    updateContentData({ supplier_ids: currentIds.filter((id: string) => id !== supplierId) });
  };

  const addCategory = (categoryId: string) => {
    const currentIds = editedBlock.content_data.category_ids || [];
    if (!currentIds.includes(categoryId)) {
      updateContentData({ category_ids: [...currentIds, categoryId] });
    }
  };

  const removeCategory = (categoryId: string) => {
    const currentIds = editedBlock.content_data.category_ids || [];
    updateContentData({ category_ids: currentIds.filter((id: string) => id !== categoryId) });
  };

  const addSlide = () => {
    const currentSlides = editedBlock.content_data.slides || [];
    updateContentData({
      slides: [...currentSlides, { image_url: '', title: '', description: '', link_url: '' }]
    });
  };

  const updateSlide = (index: number, updates: any) => {
    const currentSlides = editedBlock.content_data.slides || [];
    const newSlides = currentSlides.map((slide: any, i: number) => 
      i === index ? { ...slide, ...updates } : slide
    );
    updateContentData({ slides: newSlides });
  };

  const removeSlide = (index: number) => {
    const currentSlides = editedBlock.content_data.slides || [];
    updateContentData({ slides: currentSlides.filter((_: any, i: number) => i !== index) });
  };

  const renderBlockSpecificEditor = () => {
    switch (block.block_name) {
      case 'featured_suppliers':
      case 'trending_now':
        return (
          <div className="space-y-4">
            <div>
              <Label>Selected Suppliers</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(editedBlock.content_data.supplier_ids || []).map((supplierId: string) => {
                  const supplier = suppliers.find(s => s.id === supplierId);
                  return supplier ? (
                    <Badge key={supplierId} variant="secondary" className="gap-1">
                      {supplier.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSupplier(supplierId)} />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            
            <div>
              <Label>Add Supplier</Label>
              <Select onValueChange={addSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier to add" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter(s => !(editedBlock.content_data.supplier_ids || []).includes(s.id))
                    .map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'top_categories':
        return (
          <div className="space-y-4">
            <div>
              <Label>Selected Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(editedBlock.content_data.category_ids || []).map((categoryId: string) => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="gap-1">
                      {category.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCategory(categoryId)} />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            
            <div>
              <Label>Add Category</Label>
              <Select onValueChange={addCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category to add" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(c => !(editedBlock.content_data.category_ids || []).includes(c.id))
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'new_suppliers':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mode</Label>
              <Select 
                value={editedBlock.content_data.mode || 'auto'}
                onValueChange={(value) => updateContentData({ mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatic (Latest Suppliers)</SelectItem>
                  <SelectItem value="manual">Manual Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editedBlock.content_data.mode === 'auto' ? (
              <div>
                <Label>Number of Suppliers</Label>
                <Input
                  type="number"
                  value={editedBlock.content_data.count || 6}
                  onChange={(e) => updateContentData({ count: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Selected Suppliers</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(editedBlock.content_data.supplier_ids || []).map((supplierId: string) => {
                      const supplier = suppliers.find(s => s.id === supplierId);
                      return supplier ? (
                        <Badge key={supplierId} variant="secondary" className="gap-1">
                          {supplier.name}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSupplier(supplierId)} />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <Label>Add Supplier</Label>
                  <Select onValueChange={addSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter(s => !(editedBlock.content_data.supplier_ids || []).includes(s.id))
                        .map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );

      case 'marketing_banner_1':
        return (
          <div className="space-y-4">
            <div>
              <Label>Banner Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {editedBlock.content_data.image_url && (
                  <div className="relative">
                    <img 
                      src={editedBlock.content_data.image_url} 
                      alt="Banner preview" 
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => updateContentData({ image_url: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label>Link URL</Label>
              <Input
                value={editedBlock.content_data.link_url || ''}
                onChange={(e) => updateContentData({ link_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <Label>Button Text</Label>
              <Input
                value={editedBlock.content_data.button_text || ''}
                onChange={(e) => updateContentData({ button_text: e.target.value })}
                placeholder="Learn More"
              />
            </div>
          </div>
        );

      case 'carousel_slides':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Slides</Label>
              <Button onClick={addSlide} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Slide
              </Button>
            </div>
            
            <div className="space-y-4">
              {(editedBlock.content_data.slides || []).map((slide: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4" />
                        Slide {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlide(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={slide.image_url || ''}
                        onChange={(e) => updateSlide(index, { image_url: e.target.value })}
                        placeholder="Image URL"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={slide.title || ''}
                        onChange={(e) => updateSlide(index, { title: e.target.value })}
                        placeholder="Slide title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={slide.description || ''}
                        onChange={(e) => updateSlide(index, { description: e.target.value })}
                        placeholder="Slide description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Link URL</Label>
                      <Input
                        value={slide.link_url || ''}
                        onChange={(e) => updateSlide(index, { link_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedBlock.content_data.auto_play || false}
                onCheckedChange={(checked) => updateContentData({ auto_play: checked })}
              />
              <Label>Auto-play slides</Label>
            </div>
            
            {editedBlock.content_data.auto_play && (
              <div>
                <Label>Interval (seconds)</Label>
                <Input
                  type="number"
                  value={editedBlock.content_data.interval ? editedBlock.content_data.interval / 1000 : 5}
                  onChange={(e) => updateContentData({ interval: parseInt(e.target.value) * 1000 })}
                  min="1"
                  max="30"
                />
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported block type</div>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Edit {editedBlock.content_data.title || block.block_name.replace(/_/g, ' ')}
          </DialogTitle>
          <DialogDescription>
            Configure the content and settings for this block
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Settings</h3>
              
              <div>
                <Label>Title</Label>
                <Input
                  value={editedBlock.content_data.title || ''}
                  onChange={(e) => updateContentData({ title: e.target.value })}
                  placeholder="Block title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editedBlock.content_data.description || ''}
                  onChange={(e) => updateContentData({ description: e.target.value })}
                  placeholder="Block description"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editedBlock.display_order}
                  onChange={(e) => setEditedBlock(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule (Optional)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={editedBlock.start_date ? new Date(editedBlock.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditedBlock(prev => ({ ...prev, start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={editedBlock.end_date ? new Date(editedBlock.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditedBlock(prev => ({ ...prev, end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                </div>
              </div>
            </div>

            {/* Block-specific settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Settings</h3>
              {renderBlockSpecificEditor()}
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}