import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UploadPhotoData } from '@/types/inspiration';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

const ROOMS = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'חדר ילדים', 'משרד', 'גינה', 'מרפסת', 'חדר אוכל'];
const STYLES = ['מודרני', 'קלאסי', 'כפרי', 'תעשייתי', 'סקנדינבי', 'מזרח תיכוני', 'מינימליסטי', 'בוהמיאני'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function PhotoUploadModal({ isOpen, onOpenChange, onUploadComplete }: PhotoUploadModalProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: סוג קובץ לא נתמך`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: הקובץ גדול מדי (מקסימום 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    if (!formData.title.trim()) {
      toast.error('נדרש כותרת');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        // Upload image to storage
        const { error: uploadError } = await supabase.storage
          .from('inspiration-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create image object to get dimensions
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Insert photo record
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            title: files.length === 1 ? formData.title : `${formData.title} (${i + 1})`,
            description: formData.description || null,
            storage_path: fileName,
            room: formData.room || null,
            style: formData.style || null,
            width: img.width,
            height: img.height,
            uploader_id: user.id,
            is_public: formData.is_public
          });

        if (dbError) throw dbError;

        // Add tags if any
        if (formData.tags.length > 0) {
          const { data: photoData } = await supabase
            .from('photos')
            .select('id')
            .eq('storage_path', fileName)
            .single();

          if (photoData) {
            const tagInserts = formData.tags.map(tag => ({
              photo_id: photoData.id,
              tag
            }));

            const { error: tagsError } = await supabase
              .from('photo_tags')
              .insert(tagInserts);

            if (tagsError) console.error('Error adding tags:', tagsError);
          }
        }

        URL.revokeObjectURL(imageUrl);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast.success(`${files.length} תמונות הועלו בהצלחה! נשלחו לאישור מנהל`);
      
      // Reset form
      setFiles([]);
      setFormData({
        title: '',
        description: '',
        room: '',
        style: '',
        tags: [],
        is_public: false
      });
      
      onUploadComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('שגיאה בהעלאת התמונות');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>העלאת תמונות השראה</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* File Upload */}
          <div>
            <Label>בחר תמונות</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">לחץ לבחירת תמונות</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP - עד 10MB</p>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">תמונות נבחרות:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="כותרת התמונה..."
                disabled={uploading}
              />
            </div>

            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="תיאור התמונה..."
                disabled={uploading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room">חדר</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חדר..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOMS.map(room => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">סגנון</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סגנון..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map(style => (
                      <SelectItem key={style} value={style}>{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>תגים</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="הוסף תג..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim() || uploading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={uploading}
                      >
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מעלה תמונות...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || !formData.title.trim() || uploading}
            >
              {uploading ? 'מעלה...' : `העלה ${files.length} תמונות`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}