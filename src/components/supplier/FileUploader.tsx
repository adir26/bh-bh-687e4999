import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, File, Image, Camera, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCapacitorCamera } from '@/hooks/useCapacitorCamera';

interface FileUploaderProps {
  orderId: string;
  onFileUploaded?: (file: { url: string; label: string }) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  url: string;
  label: string;
  name: string;
  size: number;
  type: string;
}

export function FileUploader({ 
  orderId, 
  onFileUploaded, 
  accept = "image/*,.pdf,.doc,.docx,.txt", 
  maxSizeMB = 10,
  className 
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takePhoto, selectFromGallery, isNative, isLoading: cameraLoading } = useCapacitorCamera();
  
  const isImageUpload = accept.includes('image/*');

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${orderId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('orders')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('orders')
        .getPublicUrl(filePath);

      // Save attachment record to database
      const { error: dbError } = await supabase
        .from('order_attachments')
        .insert({
          order_id: orderId,
          file_url: publicUrl,
          label: label || file.name
        });

      if (dbError) throw dbError;

      toast.success('הקובץ הועלה בהצלחה');
      
      // Reset form
      setLabel('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded({
          url: publicUrl,
          label: label || file.name
        });
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`הקובץ גדול מדי. גודל מקסימלי: ${maxSizeMB}MB`);
      return;
    }

    await uploadFile(file);
  };

  const handleTakePhoto = async () => {
    const file = await takePhoto();
    if (file) {
      await uploadFile(file);
    }
  };

  const handleSelectFromGallery = async () => {
    const file = await selectFromGallery();
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="file-label">תווית לקובץ (אופציונלי)</Label>
        <Input
          id="file-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="תיאור הקובץ..."
          disabled={uploading}
        />
      </div>

      <div>
        <Label htmlFor="file-upload">העלה קובץ</Label>
        <div className="space-y-3">
          {isNative && isImageUpload && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTakePhoto}
                disabled={uploading || cameraLoading}
                className="h-16 flex-col"
              >
                <Camera className="h-5 w-5 mb-1" />
                <span className="text-xs">צלם תמונה</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFromGallery}
                disabled={uploading || cameraLoading}
                className="h-16 flex-col"
              >
                <ImageIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">בחר מהגלריה</span>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-shrink-0"
            >
              <Upload className="w-4 h-4 ml-2" />
              {uploading ? 'מעלה...' : 'העלה'}
            </Button>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        קבצים נתמכים: תמונות, PDF, Word, טקסט. גודל מקסימלי: {maxSizeMB}MB
      </div>
    </div>
  );
}

interface FileListProps {
  orderId: string;
  files: UploadedFile[];
  onFileDeleted?: (fileId: string) => void;
  className?: string;
}

export function FileList({ orderId, files, onFileDeleted, className }: FileListProps) {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleDeleteFile = async (file: UploadedFile) => {
    setDeletingFiles(prev => new Set(prev).add(file.id));
    
    try {
      // Extract file path from URL
      const urlParts = file.url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // orderId/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('orders')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('order_attachments')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast.success('הקובץ נמחק בהצלחה');
      
      if (onFileDeleted) {
        onFileDeleted(file.id);
      }

    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('שגיאה במחיקת הקובץ');
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
    }
  };

  if (!files.length) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg ${className}`}>
        <File className="w-8 h-8 mb-2" />
        <p>אין קבצים מועלים</p>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    return File;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {files.map((file) => {
        const Icon = getFileIcon(file.type);
        const isDeleting = deletingFiles.has(file.id);
        
        return (
          <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.label}</div>
              <div className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
              >
                צפה
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFile(file)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}