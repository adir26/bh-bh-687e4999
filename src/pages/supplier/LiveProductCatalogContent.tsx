import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Upload, X, Grid, List, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/AuthContext";
import { productsService, DBProduct, validateImageFiles, IMAGE_MAX_SIZE, PRODUCTS_PER_PAGE } from "@/services/productsService";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePageLoadTimer } from '@/hooks/usePageLoadTimer';
import { PageBoundary } from '@/components/system/PageBoundary';

const currencySymbol = (c?: string) => (c === "ILS" || !c ? "₪" : c);

const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  // RLS/Permission errors
  if (
    message.includes('permission denied') || 
    message.includes('42501') ||
    message.includes('new row violates row-level security') ||
    message.includes('rls') ||
    message.includes('policy')
  ) {
    return 'אין הרשאה לבצע פעולה זו. נא לוודא שהחשבון מוגדר כספק במערכת.';
  }
  
  // Storage-specific errors
  if (message.includes('storage') || message.includes('bucket')) {
    return 'שגיאה בהעלאת תמונות. נא לנסות שוב או לפנות לתמיכה.';
  }
  
  // Validation errors - keep as-is
  if (message.includes('נדרש') || message.includes('חייב') || message.includes('required')) {
    return error.message;
  }
  
  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'שגיאת תקשורת. נא לנסות שוב.';
  }
  
  // Default
  return error.message;
};

export default function LiveProductCatalogContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supplierId = user?.id;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [publishFilter, setPublishFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProduct | null>(null);
  const [form, setForm] = useState<{ 
    name: string; 
    description?: string; 
    price?: number; 
    currency?: string; 
    newFiles: File[];  // ✅ Changed from 'files'
    primaryImageIndex: number;  // ✅ NEW
  }>({
    name: "",
    description: "",
    price: undefined,
    currency: "ILS",
    newFiles: [],
    primaryImageIndex: 0,
  });

  // ✅ NEW: State for existing images (from product_images table)
  const [existingImages, setExistingImages] = useState<Array<{
    id: string;
    storage_path: string;
    public_url: string;
    is_primary: boolean;
  }>>([]);

  usePageLoadTimer('LiveProductCatalogContent');

  // Get product data with pagination
  const { data: productData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['supplier-products', supplierId, page, search],
    queryFn: async () => {
      if (!supplierId) return { items: [], totalCount: 0, hasNextPage: false, hasPrevPage: false };
      if (search.trim()) {
        return await productsService.searchProducts(supplierId, search.trim(), page);
      }
      return await productsService.listBySupplier(supplierId, page);
    },
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });

  // Get product stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ['product-stats', supplierId],
    queryFn: async () => {
      if (!supplierId) return { total: 0, published: 0, hidden: 0 };
      return await productsService.getProductStats(supplierId);
    },
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!productData?.items) return [];
    if (publishFilter === 'all') return productData.items;
    const isPublishedFilter = publishFilter === 'published';
    return productData.items.filter(p => p.is_published === isPublishedFilter);
  }, [productData?.items, publishFilter]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error('No supplier ID');
      if (!form.name.trim()) throw new Error("שם מוצר נדרש");
      if (form.price != null && form.price < 0) throw new Error("המחיר חייב להיות מספר חיובי");

      // Validate new files
      if (form.newFiles.length > 0) {
        const imageErrors = validateImageFiles(form.newFiles);
        if (imageErrors.length > 0) throw new Error(imageErrors.join('\n'));
      }

      // Check total images limit (existing + new)
      if (existingImages.length + form.newFiles.length > 5) {
        throw new Error("מקסימום 5 תמונות למוצר");
      }

      // Step 1: Create/Update product
      let product: DBProduct;
      if (!editing) {
        product = await productsService.create(supplierId, {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          price: form.price,
          currency: form.currency || "ILS",
        });
      } else {
        product = await productsService.update(editing.id, {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          price: form.price,
          currency: form.currency || "ILS",
        });
      }

      // Step 2: Upload new images
      for (let i = 0; i < form.newFiles.length; i++) {
        const file = form.newFiles[i];
        const isPrimary = (existingImages.length === 0 && i === form.primaryImageIndex);
        
        await productsService.uploadImage(
          file, 
          supplierId, 
          product.id,
          isPrimary
        );
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      // ✅ NEW: Invalidate supplier profile cache
      queryClient.invalidateQueries({ queryKey: ['public-supplier'] });
      queryClient.invalidateQueries({ queryKey: ['company', supplierId] });
      
      toast({ title: editing ? "המוצר עודכן בהצלחה" : "המוצר נוצר בהצלחה" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ 
        title: "שגיאה ביצירת מוצר", 
        description: getErrorMessage(error), 
        variant: "destructive" 
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (product: DBProduct) => {
      // ✅ Images will be deleted automatically via CASCADE in DB
      return await productsService.remove(product.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['public-supplier'] });
      toast({ title: "המוצר נמחק בהצלחה" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "מחיקה נכשלה", 
        description: getErrorMessage(error), 
        variant: "destructive" 
      });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ productId, checked }: { productId: string; checked: boolean }) => {
      if (!supplierId) return;
      return await productsService.togglePublish(productId, checked, supplierId);
    },
    onSuccess: (_, { checked }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({ title: checked ? "המוצר פורסם" : "הפרסום בוטל" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "עדכון סטטוס נכשל", 
        description: getErrorMessage(error), 
        variant: "destructive" 
      });
    }
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setForm({
      name: "",
      description: "",
      price: undefined,
      currency: "ILS",
      newFiles: [],
      primaryImageIndex: 0,
    });
    setExistingImages([]);
    setEditing(null);
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: undefined,
      currency: "ILS",
      newFiles: [],
      primaryImageIndex: 0,
    });
    setExistingImages([]);
    setDialogOpen(true);
  };

  const openEdit = async (p: DBProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price ?? undefined,
      currency: p.currency || "ILS",
      newFiles: [],
      primaryImageIndex: 0,
    });
    
    // ✅ Load existing images from product_images table
    if (supplierId) {
      try {
        const images = await productsService.getProductImages(p.id);
        setExistingImages(images);
      } catch (error) {
        console.warn('Failed to load product images:', error);
        setExistingImages([]);
      }
    }
    
    setDialogOpen(true);
  };

  const handleRemove = (p: DBProduct) => {
    if (!confirm("למחוק את המוצר? פעולה זו תמחק גם את כל התמונות הקשורות למוצר.")) return;
    removeMutation.mutate(p);
  };

  const handleToggle = (p: DBProduct, checked: boolean) => {
    if (checked && (!p.name || p.price == null)) {
      toast({ title: "כדי לפרסם יש למלא שם ומחיר", variant: "destructive" });
      return;
    }
    toggleMutation.mutate({ productId: p.id, checked });
  };

  const removeExistingImage = async (imageId: string) => {
    if (!supplierId) return;
    
    try {
      await productsService.deleteProductImage(imageId, supplierId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({ title: "התמונה נמחקה" });
    } catch (error) {
      toast({ title: "מחיקת תמונה נכשלה", variant: "destructive" });
    }
  };

  const removeFileFromForm = (index: number) => {
    setForm(prev => ({
      ...prev,
      newFiles: prev.newFiles.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      primaryImageIndex: index
    }));
  };

  return (
    <PageBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    >
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="mobile-container px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold">קטלוג מוצרים ושירותים</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 xs:h-9 xs:w-9 p-0"
                  >
                    <Grid className="w-3 h-3 xs:w-4 xs:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 xs:h-9 xs:w-9 p-0"
                  >
                    <List className="w-3 h-3 xs:w-4 xs:h-4" />
                  </Button>
                </div>
                <Button variant="blue" onClick={openNew} className="h-8 xs:h-9 text-xs xs:text-sm px-2 xs:px-3">
                  <Plus className="w-3 h-3 xs:w-4 xs:h-4 ml-1" />
                  <span className="hidden xs:inline">הוסף מוצר/שירות</span>
                  <span className="xs:hidden">הוסף</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mobile-container px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 pb-nav-safe">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6">
            <Card className="mobile-card">
              <CardContent className="p-3 xs:p-4 text-center">
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-primary">{stats?.total || 0}</div>
                <div className="text-xs xs:text-sm text-muted-foreground">סה"כ מוצרים</div>
              </CardContent>
            </Card>
            <Card className="mobile-card">
              <CardContent className="p-3 xs:p-4 text-center">
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">{stats?.published || 0}</div>
                <div className="text-xs xs:text-sm text-muted-foreground">פורסמו</div>
              </CardContent>
            </Card>
            <Card className="mobile-card">
              <CardContent className="p-3 xs:p-4 text-center">
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-yellow-600">{stats?.hidden || 0}</div>
                <div className="text-xs xs:text-sm text-muted-foreground">מוסתרים</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
            <SearchInput
              placeholder="חפש מוצרים ושירותים..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0); // Reset to first page on search
              }}
              onClear={() => {
                setSearch("");
                setPage(0);
              }}
              className="h-10 xs:h-11"
            />
            <Select value={publishFilter} onValueChange={setPublishFilter}>
              <SelectTrigger className="w-full xs:w-40 h-10 xs:h-11">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="published">פורסם</SelectItem>
                <SelectItem value="hidden">מוסתר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <EmptyState
              title="אין מוצרים להצגה"
              description="התחילו להוסיף מוצרים ושירותים לקטלוג שלכם."
              action={{ label: 'הוסף מוצר ראשון', onClick: openNew }}
              className="mb-4"
            />
          )}

          {/* Products Display - Responsive Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {filtered.map((p) => (
                <Card key={p.id} className="group hover:shadow-lg transition-all overflow-hidden">
                  {/* Image Container - 4:3 aspect ratio */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={(p as any).primaryImage || "/placeholder.svg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant={p.is_published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.is_published ? 'פורסם' : 'טיוטה'}
                      </Badge>
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(p)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm mb-1 truncate">
                      {p.name}
                    </h3>
                    
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {p.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {p.price && (
                        <span className="font-bold text-primary text-sm">
                          {currencySymbol(p.currency)}{p.price.toLocaleString()}
                        </span>
                      )}
                      
                      <Switch
                        checked={p.is_published}
                        onCheckedChange={(checked) => handleToggle(p, checked)}
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mobile-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">מוצר/שירות</th>
                        <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">מחיר</th>
                        <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">סטטוס</th>
                        <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-muted/50">
                           <td className="p-2 xs:p-3 sm:p-4">
                            <div className="flex items-center gap-2 xs:gap-3">
                              <img
                                src={(p as any).primaryImage || "/placeholder.svg"}
                                alt={p.name}
                                className="w-10 h-10 xs:w-12 xs:h-12 object-cover rounded"
                                loading="lazy"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-xs xs:text-sm truncate">{p.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">
                            {p.price ? `${currencySymbol(p.currency)}${p.price.toLocaleString()}` : 'ללא מחיר'}
                          </td>
                          <td className="p-2 xs:p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                              <Switch checked={p.is_published} onCheckedChange={(c) => handleToggle(p, c)} />
                              <Badge className={`text-xs ${p.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {p.is_published ? 'פורסם' : 'מוסתר'}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2 xs:p-3 sm:p-4">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="h-7 w-7 xs:h-8 xs:w-8 p-0" onClick={() => openEdit(p)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 w-7 xs:h-8 xs:w-8 p-0" onClick={() => handleRemove(p)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {productData && productData.totalCount > PRODUCTS_PER_PAGE && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                מציג {page * PRODUCTS_PER_PAGE + 1}-{Math.min((page + 1) * PRODUCTS_PER_PAGE, productData.totalCount)} מתוך {productData.totalCount}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={!productData.hasPrevPage}
                >
                  <ChevronRight className="w-4 h-4" />
                  קודם
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!productData.hasNextPage}
                >
                  הבא
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "עריכת מוצר" : "מוצר חדש"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">שם המוצר *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="הכנס שם מוצר..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">מחיר</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="0.01"
                    value={form.price ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">מטבע</Label>
                  <Select value={form.currency} onValueChange={(value) => setForm((f) => ({ ...f, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר מטבע" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ILS">שקל (₪)</SelectItem>
                      <SelectItem value="USD">דולר ($)</SelectItem>
                      <SelectItem value="EUR">יורו (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="תיאור המוצר או השירות..."
                  rows={3}
                />
              </div>

              {/* Image Management */}
              <div className="space-y-3">
                <Label>תמונות מוצר (עד 5)</Label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">תמונות קיימות:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.public_url} 
                            alt="תמונה" 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {img.is_primary && (
                            <Badge className="absolute top-1 right-1 text-xs bg-blue-600">ראשית</Badge>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() => removeExistingImage(img.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {form.newFiles.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">תמונות חדשות:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {form.newFiles.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="תצוגה מקדימה" 
                            className="w-full h-24 object-cover rounded-lg cursor-pointer"
                            onClick={() => setPrimaryImage(idx)}
                          />
                          {idx === form.primaryImageIndex && existingImages.length === 0 && (
                            <Badge className="absolute top-1 right-1 text-xs bg-blue-600">ראשית</Badge>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() => removeFileFromForm(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 לחץ על תמונה כדי להגדיר אותה כראשית
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                {(existingImages.length + form.newFiles.length) < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    העלה תמונות ({5 - existingImages.length - form.newFiles.length} נותרו)
                  </Button>
                )}
                
                <input
                  id="file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const remaining = 5 - existingImages.length - form.newFiles.length;
                    const toAdd = files.slice(0, remaining);
                    
                    const errors = validateImageFiles(toAdd);
                    if (errors.length > 0) {
                      toast({ title: "שגיאות בקבצים", description: errors.join('\n'), variant: "destructive" });
                      e.target.value = '';
                      return;
                    }
                    
                    setForm(prev => ({
                      ...prev,
                      newFiles: [...prev.newFiles, ...toAdd]
                    }));
                    
                    e.target.value = '';
                  }}
                />
                
                <p className="text-xs text-muted-foreground">
                  קבצים מותרים: JPG, PNG, WebP | מקסימום: {IMAGE_MAX_SIZE / 1024 / 1024}MB לקובץ
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeDialog} disabled={saveMutation.isPending}>
                ביטול
              </Button>
              <Button variant="blue" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "שומר..." : editing ? "עדכן מוצר" : "צור מוצר"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageBoundary>
  );
}
