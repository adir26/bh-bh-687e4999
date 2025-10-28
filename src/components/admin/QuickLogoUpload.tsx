import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface QuickLogoUploadProps {
  companyId: string;
  companyName: string;
  currentLogoUrl?: string | null;
  open: boolean;
  onClose: () => void;
}

export function QuickLogoUpload({ 
  companyId, 
  companyName, 
  currentLogoUrl, 
  open, 
  onClose 
}: QuickLogoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'שגיאה',
        description: 'יש להעלות קובץ תמונה בלבד',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'שגיאה',
        description: 'גודל הקובץ חייב להיות קטן מ-5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${companyId}/logos/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-media')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-media')
        .getPublicUrl(fileName);

      // Update company logo_url in database
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', companyId);

      if (updateError) throw updateError;

      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['approved-suppliers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] }),
        queryClient.invalidateQueries({ queryKey: ['homepage-items'] }),
        queryClient.invalidateQueries({ queryKey: ['homepage-public-content'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-suppliers'] }),
      ]);

      toast({
        title: 'הצלחה',
        description: 'הלוגו הועלה ועודכן בהצלחה',
      });

      // Reset and close
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בהעלאת הלוגו',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">העלאת לוגו - {companyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Logo */}
          {currentLogoUrl && !previewUrl && (
            <div>
              <Label className="text-right block mb-2">לוגו נוכחי</Label>
              <div className="flex justify-center">
                <img
                  src={currentLogoUrl}
                  alt="לוגו נוכחי"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-muted"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div>
              <Label className="text-right block mb-2">תצוגה מקדימה</Label>
              <div className="relative flex justify-center">
                <img
                  src={previewUrl}
                  alt="תצוגה מקדימה"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -left-2 h-6 w-6"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          {/* File Input */}
          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Label
              htmlFor="logo-upload"
              className={`
                cursor-pointer flex items-center justify-center gap-2 px-4 py-8 
                border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedFile ? 'בחר קובץ אחר' : 'בחר קובץ תמונה'}
              </span>
            </Label>
            <p className="text-xs text-muted-foreground text-center mt-2">
              JPG, PNG או WEBP עד 5MB
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            ביטול
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                מעלה...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 ml-2" />
                העלה לוגו
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
