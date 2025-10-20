import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface EditableImageProps {
  currentUrl: string | null;
  isEditMode: boolean;
  onUpload: (url: string) => Promise<void>;
  companyId: string;
  type: 'logo' | 'banner';
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  currentUrl,
  isEditMode,
  onUpload,
  companyId,
  type,
  alt,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.error('יש להעלות קובץ תמונה בלבד');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast.error('גודל הקובץ חייב להיות קטן מ-10MB');
        return;
      }

      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${type}s/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-media')
        .getPublicUrl(fileName);

      await onUpload(publicUrl);
      showToast.success('התמונה הועלתה בהצלחה');
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  if (!isEditMode) {
    // Normal view mode
    if (type === 'banner') {
      return currentUrl ? (
        <div className={`w-full h-48 md:h-64 overflow-hidden ${className}`}>
          <img 
            src={currentUrl} 
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null;
    }

    // Logo
    return currentUrl ? (
      <div className={`relative ${className}`}>
        <img
          src={currentUrl}
          alt={alt}
          className="w-20 h-20 rounded-full object-cover border-2 border-primary/10"
        />
      </div>
    ) : (
      <div className={`w-20 h-20 rounded-full bg-muted flex items-center justify-center ${className}`}>
        <ImageIcon className="w-10 h-10 text-muted-foreground" />
      </div>
    );
  }

  // Edit mode
  return (
    <div className={`relative group ${className}`}>
      {/* Current Image */}
      {type === 'banner' ? (
        currentUrl ? (
          <div className="w-full h-48 md:h-64 overflow-hidden">
            <img 
              src={currentUrl} 
              alt={alt}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 md:h-64 bg-muted flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )
      ) : (
        currentUrl ? (
          <img
            src={currentUrl}
            alt={alt}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/10"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
        )
      )}

      {/* Upload Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <input
          type="file"
          id={`upload-${type}-${companyId}`}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor={`upload-${type}-${companyId}`}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            asChild
          >
            <span className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מעלה...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  {currentUrl ? 'החלף תמונה' : 'העלה תמונה'}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};
