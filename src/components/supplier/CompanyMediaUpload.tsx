import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface CompanyMediaUploadProps {
  companyId: string;
  currentUrl?: string | null;
  folder: 'logos' | 'banners' | 'gallery';
  onUploadComplete: (url: string) => void;
  className?: string;
}

export const CompanyMediaUpload: React.FC<CompanyMediaUploadProps> = ({
  companyId,
  currentUrl,
  folder,
  onUploadComplete,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const fileName = `${companyId}/${folder}/${Date.now()}.${fileExt}`;

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

      onUploadComplete(publicUrl);
      showToast.success('התמונה הועלתה בהצלחה');
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        id={`upload-${folder}`}
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
      <label htmlFor={`upload-${folder}`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          asChild
        >
          <span>
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מעלה...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 ml-2" />
                {currentUrl ? 'שנה תמונה' : 'העלה תמונה'}
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};