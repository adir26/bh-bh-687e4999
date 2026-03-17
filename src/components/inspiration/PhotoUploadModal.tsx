import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Plus, Camera, ImageIcon, GripVertical, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UploadPhotoData } from '@/types/inspiration';
import { useCapacitorCamera } from '@/hooks/useCapacitorCamera';
import { cn } from '@/lib/utils';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
  /** If provided, links photos to supplier company */
  companyId?: string;
}

const ROOMS = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'חדר ילדים', 'משרד', 'גינה', 'מרפסת', 'חדר אוכל'];
const STYLES = ['מודרני', 'קלאסי', 'כפרי', 'תעשייתי', 'סקנדינבי', 'מזרח תיכוני', 'מינימליסטי', 'בוהמיאני'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface UploadFile {
  file: File;
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function PhotoUploadModal({ isOpen, onOpenChange, onUploadComplete, companyId }: PhotoUploadModalProps) {
  const { user, profile } = useAuth();
  const { takePhoto, selectFromGallery, isNative, isLoading: cameraLoading } = useCapacitorCamera();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState<UploadPhotoData>({
    title: '',
    description: '',
    room: '',
    style: '',
    tags: [],
    is_public: false
  });
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSupplier = profile?.role === 'supplier';

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: סוג קובץ לא נתמך. נתמכים: JPG, PNG, WebP`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: גדול מדי (מקסימום 10MB)`);
        return false;
      }
      return true;
    });

    if (uploadFiles.length + validFiles.length > MAX_FILES) {
      toast.error(`ניתן להעלות עד ${MAX_FILES} תמונות בכל פעם`);
      return;
    }

    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [uploadFiles.length]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
    // Reset input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const handleTakePhoto = async () => {
    const file = await takePhoto();
    if (file) addFiles([file]);
  };

  const handleSelectFromGallery = async () => {
    const file = await selectFromGallery();
    if (file) addFiles([file]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.includes(trimmed) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleUpload = async () => {
    if (!user || uploadFiles.length === 0) return;
    if (!formData.title.trim()) {
      toast.error('נדרש כותרת לתמונה');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedCount(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const uf = uploadFiles[i];
      
      // Mark as uploading
      setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'uploading' } : f));

      try {
        const fileExt = uf.file.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('inspiration-photos')
          .upload(fileName, uf.file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        // Get image dimensions
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = uf.preview;
        });

        // Insert photo record
        const { data: photoData, error: dbError } = await supabase
          .from('photos')
          .insert({
            title: uploadFiles.length === 1 ? formData.title : `${formData.title} (${i + 1})`,
            description: formData.description || null,
            storage_path: fileName,
            room: formData.room || null,
            style: formData.style || null,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            uploader_id: user.id,
            company_id: companyId || null,
            status: 'pending',
            is_public: false
          })
          .select('id')
          .single();

        if (dbError) throw dbError;

        // Add tags
        if (formData.tags.length > 0 && photoData) {
          await supabase
            .from('photo_tags')
            .insert(formData.tags.map(tag => ({ photo_id: photoData.id, tag })));
        }

        // Mark done
        setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'done' } : f));
        successCount++;
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error', error: error.message } : f));
        failCount++;
      }

      setUploadedCount(i + 1);
      setUploadProgress(((i + 1) / uploadFiles.length) * 100);
    }

    setUploading(false);

    if (successCount > 0) {
      setUploadComplete(true);
      onUploadComplete?.();
    }

    if (failCount > 0) {
      toast.error(`${failCount} תמונות נכשלו בהעלאה`);
    }
  };

  const handleClose = () => {
    // Cleanup previews
    uploadFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setUploadFiles([]);
    setFormData({ title: '', description: '', room: '', style: '', tags: [], is_public: false });
    setNewTag('');
    setUploadProgress(0);
    setUploadedCount(0);
    setUploadComplete(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {uploadComplete ? '✅ ההעלאה הושלמה!' : 'העלאת תמונות השראה'}
          </DialogTitle>
        </DialogHeader>

        {uploadComplete ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {uploadFiles.filter(f => f.status === 'done').length} תמונות הועלו בהצלחה!
              </h3>
              <p className="text-muted-foreground text-sm">
                התמונות נשלחו לבדיקה ויופיעו בגלריה לאחר אישור מנהל המערכת.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>סגור</Button>
              <Button onClick={() => {
                setUploadComplete(false);
                setUploadFiles([]);
                setFormData({ title: '', description: '', room: '', style: '', tags: [], is_public: false });
              }}>
                העלה עוד תמונות
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
                isDragOver 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <Upload className={cn("h-8 w-8 mx-auto mb-2 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
              <p className="text-sm font-medium mb-1">
                {isDragOver ? 'שחרר כדי להעלות' : 'גרור תמונות לכאן או לחץ לבחירה'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP • עד 10MB • עד {MAX_FILES} תמונות
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Native Camera Buttons */}
            {isNative && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleTakePhoto} disabled={uploading || cameraLoading} className="h-14 flex-col gap-1">
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">צלם תמונה</span>
                </Button>
                <Button variant="outline" onClick={handleSelectFromGallery} disabled={uploading || cameraLoading} className="h-14 flex-col gap-1">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">בחר מהגלריה</span>
                </Button>
              </div>
            )}

            {/* Selected Files Preview */}
            {uploadFiles.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  {uploadFiles.length} תמונות נבחרו
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {uploadFiles.map((uf) => (
                    <div key={uf.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img
                        src={uf.preview}
                        alt="תצוגה מקדימה"
                        className={cn(
                          "w-full h-full object-cover transition-opacity",
                          uf.status === 'error' && "opacity-50"
                        )}
                      />
                      
                      {/* Status overlay */}
                      {uf.status === 'uploading' && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                      {uf.status === 'done' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      {uf.status === 'error' && (
                        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                          <X className="h-6 w-6 text-destructive" />
                        </div>
                      )}

                      {/* Remove button */}
                      {uf.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 left-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); removeFile(uf.id); }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">כותרת *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="לדוגמה: מטבח מודרני בדירה בתל אביב"
                  disabled={uploading}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ספר על הפרויקט, חומרים, השראה..."
                  disabled={uploading}
                  rows={2}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-left">
                  {formData.description?.length || 0}/500
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>חדר</Label>
                  <Select
                    value={formData.room}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, room: v }))}
                    disabled={uploading}
                  >
                    <SelectTrigger><SelectValue placeholder="בחר חדר..." /></SelectTrigger>
                    <SelectContent>
                      {ROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>סגנון</Label>
                  <Select
                    value={formData.style}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, style: v }))}
                    disabled={uploading}
                  >
                    <SelectTrigger><SelectValue placeholder="בחר סגנון..." /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>תגים (עד 10)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="הוסף תג..."
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    disabled={uploading || formData.tags.length >= 10}
                    maxLength={30}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTag} disabled={!newTag.trim() || uploading || formData.tags.length >= 10}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                        #{tag}
                        <button onClick={() => removeTag(tag)} disabled={uploading} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>מעלה תמונות...</span>
                  <span>{uploadedCount}/{uploadFiles.length}</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>ביטול</Button>
              <Button
                onClick={handleUpload}
                disabled={uploadFiles.length === 0 || !formData.title.trim() || uploading}
                className="min-w-[140px]"
              >
                {uploading ? `מעלה ${uploadedCount}/${uploadFiles.length}...` : `העלה ${uploadFiles.length} תמונות`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
