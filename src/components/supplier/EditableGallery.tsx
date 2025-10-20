import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface EditableGalleryProps {
  images: string[];
  isEditMode: boolean;
  onUpdate: (images: string[]) => Promise<void>;
  companyId: string;
  className?: string;
}

export const EditableGallery: React.FC<EditableGalleryProps> = ({
  images,
  isEditMode,
  onUpdate,
  companyId,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showToast.error(`${file.name} - יש להעלות קובץ תמונה בלבד`);
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast.error(`${file.name} - הקובץ גדול מדי (מקסימום 10MB)`);
          continue;
        }

        // Upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${companyId}/gallery/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('company-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('company-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        await onUpdate([...images, ...uploadedUrls]);
        showToast.success(`${uploadedUrls.length} תמונות הועלו בהצלחה`);
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      showToast.error('שגיאה בהעלאת תמונות');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemove = async (imageUrl: string) => {
    setRemoving(imageUrl);
    try {
      const updatedImages = images.filter(url => url !== imageUrl);
      await onUpdate(updatedImages);
      showToast.success('התמונה הוסרה');
    } catch (error) {
      console.error('Remove error:', error);
      showToast.error('שגיאה בהסרת התמונה');
    } finally {
      setRemoving(null);
    }
  };

  if (!isEditMode && (!images || images.length === 0)) {
    return null;
  }

  return (
    <div className={`bg-background ${className}`}>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">גלריה</h2>
          
          {isEditMode && (
            <div>
              <input
                type="file"
                id={`gallery-upload-${companyId}`}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label htmlFor={`gallery-upload-${companyId}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer gap-2">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        מעלה...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        הוסף תמונות
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img 
                  src={imageUrl} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(imageUrl)}
                      disabled={removing === imageUrl}
                      className="gap-2"
                    >
                      {removing === imageUrl ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          הסר
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : isEditMode ? (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">אין תמונות בגלריה</p>
            <input
              type="file"
              id={`gallery-upload-empty-${companyId}`}
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <label htmlFor={`gallery-upload-empty-${companyId}`}>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer gap-2">
                  <Upload className="w-4 h-4" />
                  העלה תמונות ראשונות
                </span>
              </Button>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
};
