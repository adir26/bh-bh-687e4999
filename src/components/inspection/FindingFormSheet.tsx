import { useEffect, useState, useRef } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInspectionItem, useUpdateInspectionItem } from '@/hooks/useInspectionItems';
import { useStandardsLibrary } from '@/hooks/useStandardsLibrary';
import { useInspectionFindings, useInspectionFindingCategories, useInspectionFindingSubCategories } from '@/hooks/useInspectionFindings';
import { useItemCosts, useDeleteInspectionCost, useCreateInspectionCost } from '@/hooks/useInspectionCosts';
import { useInspectionMedia, useUploadInspectionMedia, useDeleteInspectionMedia } from '@/hooks/useInspectionMedia';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ChevronsUpDown, DollarSign, Trash2, Image, Upload, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FindingFormSheetProps {
  reportId: string;
  item?: any;
  open: boolean;
  onClose: () => void;
}

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

  const [findingSearch, setFindingSearch] = useState('');
  const [findingOpen, setFindingOpen] = useState(false);
  const [standardSearch, setStandardSearch] = useState('');
  const [standardOpen, setStandardOpen] = useState(false);

  // Findings library
  const { data: findingCategories = [] } = useInspectionFindingCategories();
  const { data: findings = [] } = useInspectionFindings(formData.category, findingSearch);
  
  // Standards library
  const { data: standards = [] } = useStandardsLibrary(standardSearch);
  
  const createItem = useCreateInspectionItem();
  const updateItem = useUpdateInspectionItem();
  
  // Costs management
  const { data: existingCosts = [], isLoading: costsLoading } = useItemCosts(item?.id || '');
  const deleteCost = useDeleteInspectionCost();
  const createCost = useCreateInspectionCost();
  const [showAddCost, setShowAddCost] = useState(false);
  
  // New costs for new items
  const [newCosts, setNewCosts] = useState<Array<{
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
  }>>([]);

  const costs = item?.id ? existingCosts : newCosts;
  const totalCost = costs.reduce((sum, cost) => sum + (cost.total || 0), 0);

  // Media management
  const { data: existingMedia = [], isLoading: mediaLoading } = useInspectionMedia(reportId, item?.id);
  const uploadMedia = useUploadInspectionMedia();
  const deleteMedia = useDeleteInspectionMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New media files for new items
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (item?.id) {
      // Existing item - upload immediately
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          await uploadMedia.mutateAsync({
            file,
            reportId,
            itemId: item.id,
            type: file.type.startsWith('video/') ? 'video' : 'photo',
          });
        }
      }
    } else {
      // New item - store files to upload after creation
      setNewMediaFiles([...newMediaFiles, ...Array.from(files)]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewMedia = (index: number) => {
    setNewMediaFiles(newMediaFiles.filter((_, i) => i !== index));
  };

  const handleAddNewCost = () => {
    setNewCosts([...newCosts, { quantity: 1, unit: 'יחידה', unit_price: 0, total: 0 }]);
  };

  const handleRemoveNewCost = (index: number) => {
    setNewCosts(newCosts.filter((_, i) => i !== index));
  };

  const handleNewCostChange = (index: number, field: string, value: any) => {
    const updated = [...newCosts];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    
    setNewCosts(updated);
  };

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

  const handleFindingSelect = (finding: any) => {
    setFormData({
      ...formData,
      title: finding.finding,
      description: finding.description || '',
      category: finding.category,
    });
    setFindingOpen(false);
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
          {/* Tabs for Finding Library vs Standards */}
          <Tabs defaultValue="findings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="findings" className="gap-2">
                <BookOpen className="h-4 w-4" />
                ספריית ממצאים
              </TabsTrigger>
              <TabsTrigger value="standards">תקנים</TabsTrigger>
            </TabsList>

            {/* Findings Library Tab */}
            <TabsContent value="findings" className="space-y-4">
              {/* Category Selection */}
              <div>
                <Label>קטגוריה</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    setFindingSearch(''); // Reset search when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {findingCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Finding Selection */}
              {formData.category && (
                <div>
                  <Label>בחר ממצא מהספרייה</Label>
                  <Popover open={findingOpen} onOpenChange={setFindingOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {formData.title || 'בחר ממצא או הזן ידנית'}
                        <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="חפש ממצא..."
                          value={findingSearch}
                          onValueChange={setFindingSearch}
                        />
                        <CommandList>
                          <CommandEmpty>לא נמצאו ממצאים</CommandEmpty>
                          <CommandGroup>
                            {findings.map((finding) => (
                              <CommandItem
                                key={finding.id}
                                onSelect={() => handleFindingSelect(finding)}
                              >
                                <Check
                                  className={cn(
                                    'ml-2 h-4 w-4',
                                    formData.title === finding.finding_name ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex-1">
                                <div className="font-medium">{finding.finding_name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {finding.finding_description}
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
              )}

              {/* Manual Title Input */}
              <div>
                <Label>כותרת ממצא (ידני)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="הזן כותרת"
                />
              </div>
            </TabsContent>

            {/* Standards Tab */}
            <TabsContent value="standards" className="space-y-4">
              <div>
                <Label>חיפוש בתקנים</Label>
                <Popover open={standardOpen} onOpenChange={setStandardOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.title || 'חפש תקן או הזן ידנית'}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
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

              {/* Manual Title Input for Standards */}
              <div>
                <Label>כותרת ממצא</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="הזן כותרת"
                />
              </div>
            </TabsContent>
          </Tabs>

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

          {/* Media Section */}
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  תמונות ווידאו
                </Label>
                <span className="text-sm text-muted-foreground">
                  {item?.id 
                    ? `${existingMedia.filter(m => m.type === 'photo').length} תמונות`
                    : `${newMediaFiles.length} קבצים`
                  }
                </span>
              </div>

              {item?.id ? (
                // Existing item - show uploaded media
                <>
                  {mediaLoading ? (
                    <p className="text-sm text-muted-foreground">טוען תמונות...</p>
                  ) : existingMedia.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {existingMedia.filter(m => m.type === 'photo').map((mediaItem) => (
                        <div key={mediaItem.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.caption || 'תמונה'}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteMedia.mutate({ id: mediaItem.id, reportId, url: mediaItem.url })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">אין תמונות מצורפות</p>
                  )}
                </>
              ) : (
                // New item - show files to upload
                <>
                  {newMediaFiles.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {newMediaFiles.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                          {file.type.startsWith('video/') ? (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <div className="text-4xl">🎥</div>
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveNewMedia(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        לא נבחרו קבצים
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        הקבצים יועלו לאחר שמירת הממצא
                      </p>
                    </div>
                  )}
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMedia.isPending}
                className="w-full"
              >
                <Upload className="ml-2 h-4 w-4" />
                {uploadMedia.isPending ? 'מעלה...' : 'העלה קבצים'}
              </Button>
            </div>
          </>

          {/* Costs Section */}
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  עלויות משוערות
                </Label>
                {costs.length > 0 && (
                  <span className="text-sm font-medium">
                    סה"כ: ₪{totalCost.toLocaleString()}
                  </span>
                )}
              </div>

              {item?.id ? (
                // Existing item - show saved costs
                <>
                  {costsLoading ? (
                    <p className="text-sm text-muted-foreground">טוען עלויות...</p>
                  ) : existingCosts.length > 0 ? (
                    <div className="space-y-2">
                      {existingCosts.map((cost) => (
                        <div key={cost.id} className="flex items-center gap-2 p-2 border rounded-lg bg-background">
                          <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                            <span className="font-medium">{cost.quantity} {cost.unit}</span>
                            <span>₪{cost.unit_price}</span>
                            <span className="font-semibold">₪{cost.total}</span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCost.mutate({ id: cost.id, itemId: item.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">אין עלויות</p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCost(!showAddCost)}
                    className="w-full"
                  >
                    {showAddCost ? 'ביטול' : '+ הוסף עלות'}
                  </Button>

                  {showAddCost && (
                    <div className="border rounded-lg p-3 bg-muted/20">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const quantity = parseFloat(formData.get('quantity') as string) || 0;
                          const unit = formData.get('unit') as string || 'יחידה';
                          const unit_price = parseFloat(formData.get('unit_price') as string) || 0;
                          
                          if (quantity && unit_price) {
                            createCost.mutate(
                              { item_id: item.id, quantity, unit, unit_price },
                              { onSuccess: () => setShowAddCost(false) }
                            );
                          }
                        }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor="quantity" className="text-xs">כמות</Label>
                            <Input
                              id="quantity"
                              name="quantity"
                              type="number"
                              defaultValue={1}
                              min="0"
                              step="0.01"
                              className="h-8"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit" className="text-xs">יחידה</Label>
                            <Input
                              id="unit"
                              name="unit"
                              defaultValue="יחידה"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit_price" className="text-xs">מחיר ליח׳</Label>
                            <Input
                              id="unit_price"
                              name="unit_price"
                              type="number"
                              min="0"
                              step="0.01"
                              className="h-8"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" size="sm" className="w-full" disabled={createCost.isPending}>
                          {createCost.isPending ? 'שומר...' : 'שמור עלות'}
                        </Button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                // New item - show temporary costs
                <>
                  {newCosts.length > 0 ? (
                    <div className="space-y-2">
                      {newCosts.map((cost, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-muted/20">
                          <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-3">
                              <Label className="text-xs">כמות</Label>
                              <Input
                                type="number"
                                value={cost.quantity}
                                onChange={(e) =>
                                  handleNewCostChange(index, 'quantity', parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="0.01"
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">יחידה</Label>
                              <Select
                                value={cost.unit}
                                onValueChange={(value) => handleNewCostChange(index, 'unit', value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="יחידה">יחידה</SelectItem>
                                  <SelectItem value="מ״ר">מ״ר</SelectItem>
                                  <SelectItem value="מ״א">מ״א</SelectItem>
                                  <SelectItem value="שעות עבודה">שעות עבודה</SelectItem>
                                  <SelectItem value="קומפלט">קומפלט</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">מחיר ליח׳</Label>
                              <Input
                                type="number"
                                value={cost.unit_price}
                                onChange={(e) =>
                                  handleNewCostChange(index, 'unit_price', parseFloat(e.target.value) || 0)
                                }
                                min="0"
                                step="0.01"
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">סה״כ</Label>
                              <Input
                                type="number"
                                value={cost.total.toFixed(2)}
                                readOnly
                                className="bg-muted h-8"
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveNewCost(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">לא הוגדרו עלויות</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        העלויות יישמרו לאחר שמירת הממצא
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewCost}
                    className="w-full"
                  >
                    + הוסף עלות
                  </Button>
                </>
              )}
            </div>
          </>

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
